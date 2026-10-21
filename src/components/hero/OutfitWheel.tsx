'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { angularDelta, inertiaProjection, lookAfterDrag, nearestEquivalentRotation, pointerAngle, rotationForLook, wrapLookIndex } from '@/lib/wheel-math';
import './outfit-wheel.css';

export type OutfitWheelProps = {
  looks: readonly { id: string; name: string }[];
  selectedLookIndex: number;
  onSelectLook: (index: number) => void;
  autoRotate?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
};

type Controller = {
  start: (x: number, y: number) => boolean;
  move: (x: number, y: number) => boolean;
  finish: (cancelled: boolean) => void;
  select: (index: number) => void;
  sync: (index: number) => void;
  hover: (value: boolean) => void;
  focus: (value: boolean) => void;
  refresh: () => void;
};
type Drag = { x: number; y: number; centerX: number; centerY: number; lastAngle: number; lastTime: number; delta: number; velocity: number; startVisual: number; lastX: number; lastY: number; selected: number; moved: boolean };
type Settle = { from: number; to: number; start: number; duration: number; selection?: number };
const positions = Array.from({ length: 8 }, (_, index) => {
  const angle = (index * 45 - 90) * Math.PI / 180;
  return { x: `${50 + Math.cos(angle) * 40}%`, y: `${50 + Math.sin(angle) * 40}%` };
});

export default function OutfitWheel({ looks, selectedLookIndex, onSelectLook, autoRotate = true, disabled = false, ariaLabel = 'Choose your Hello! outfit' }: OutfitWheelProps) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rotor = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const activePointer = useRef<number | null>(null);
  const suppressClickUntil = useRef(0);
  const suppressClickAt = useRef<{ x: number; y: number } | null>(null);
  const settings = useRef({ autoRotate, disabled, onSelectLook, userPaused: false });
  const [userPaused, setUserPaused] = useState(false);
  const selected = wrapLookIndex(selectedLookIndex);
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    settings.current = { autoRotate, disabled, onSelectLook, userPaused };
    controller.current?.refresh();
  }, [autoRotate, disabled, onSelectLook, userPaused]);

  useEffect(() => {
    const element = root.current, surface = stage.current, body = rotor.current;
    if (!element || !surface || !body) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = media.matches, visible = !document.hidden, inView = true;
    let hovered = false, focused = false, disposed = false;
    let angle = rotationForLook(wrapLookIndex(selectedLookIndex));
    let currentSelection = wrapLookIndex(selectedLookIndex);
    let drag: Drag | null = null, settle: Settle | null = null;
    let frame = 0, timer = 0, lastFrame = 0, resumeAt = 0, touchId: number | null = null;

    const paint = (value: number) => { angle = value; body.style.setProperty('--ow-rotation', `${value}deg`); };
    const commit = (index: number) => { currentSelection = wrapLookIndex(index); settings.current.onSelectLook(currentSelection); };
    const stop = () => { cancelAnimationFrame(frame); window.clearTimeout(timer); frame = 0; timer = 0; lastFrame = 0; };
    const canAnimate = () => !disposed && visible && inView;
    const idleReady = () => settings.current.autoRotate && !settings.current.disabled && !settings.current.userPaused && !reduced && !hovered && !focused && !drag;
    const complete = () => { const done = settle; settle = null; if (!done) return; paint(done.to); if (done.selection !== undefined) commit(done.selection); };
    const tick = (time: number) => {
      frame = 0;
      if (!canAnimate()) { lastFrame = 0; return; }
      if (settle) {
        const progress = Math.min(1, (time - settle.start) / settle.duration);
        paint(settle.from + (settle.to - settle.from) * (1 - Math.pow(1 - progress, 4)));
        if (progress >= 1) complete();
      } else if (idleReady() && time >= resumeAt) {
        if (lastFrame) paint(angle + Math.min(64, time - lastFrame) * 360 / 28_000);
      }
      lastFrame = time;
      schedule();
    };
    function schedule() {
      if (frame || disposed || !canAnimate()) return;
      window.clearTimeout(timer); timer = 0;
      if (settle || (idleReady() && performance.now() >= resumeAt)) frame = requestAnimationFrame(tick);
      else if (idleReady()) timer = window.setTimeout(() => { timer = 0; schedule(); }, Math.max(1, resumeAt - performance.now()));
      else lastFrame = 0;
    }
    const animateTo = (index: number, selectionAtEnd?: number) => {
      const target = nearestEquivalentRotation(rotationForLook(index), angle);
      settle = { from: angle, to: target, start: performance.now(), duration: 380, selection: selectionAtEnd };
      resumeAt = performance.now() + 2300;
      if (reduced || !canAnimate()) complete();
      schedule();
    };
    const finish = (cancelled: boolean) => {
      const gesture = drag; drag = null; delete element.dataset.dragging;
      if (!gesture) return;
      resumeAt = performance.now() + 2300;
      if (gesture.moved) {
        suppressClickUntil.current = performance.now() + 450;
        suppressClickAt.current = { x: gesture.lastX, y: gesture.lastY };
        if (cancelled) animateTo(currentSelection);
        else {
          const inertia = reduced ? 0 : inertiaProjection(gesture.velocity, performance.now() - gesture.lastTime);
          const next = lookAfterDrag(gesture.selected, gesture.delta, inertia);
          animateTo(next, next);
        }
      } else schedule();
    };
    const api: Controller = {
      start(x, y) {
        if (settings.current.disabled || drag) return false;
        const rect = surface.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
        if (Math.hypot(x - centerX, y - centerY) < rect.width * .12) return false;
        suppressClickUntil.current = 0; suppressClickAt.current = null;
        settle = null; stop();
        drag = { x, y, centerX, centerY, lastAngle: pointerAngle(x, y, centerX, centerY), lastTime: performance.now(), delta: 0, velocity: 0, startVisual: angle, lastX: x, lastY: y, selected: currentSelection, moved: false };
        return true;
      },
      move(x, y) {
        if (!drag || settings.current.disabled) return false;
        const now = performance.now(), nextAngle = pointerAngle(x, y, drag.centerX, drag.centerY);
        const delta = angularDelta(drag.lastAngle, nextAngle);
        drag.delta += delta;
        drag.velocity = .65 * drag.velocity + .35 * delta / Math.max(8, now - drag.lastTime);
        drag.lastAngle = nextAngle; drag.lastTime = now; drag.lastX = x; drag.lastY = y;
        if (!drag.moved && Math.hypot(x - drag.x, y - drag.y) >= 7 && Math.abs(drag.delta) >= 3) {
          drag.moved = true; element.dataset.dragging = 'true';
        }
        if (drag.moved) paint(drag.startVisual + drag.delta);
        return drag.moved;
      },
      finish,
      select(index) { if (settings.current.disabled) return; drag = null; delete element.dataset.dragging; settle = null; commit(index); animateTo(currentSelection); },
      sync(index) { const next = wrapLookIndex(index); if (next !== currentSelection) { currentSelection = next; drag = null; delete element.dataset.dragging; animateTo(next); } },
      hover(value) { hovered = value; if (value && !settle) stop(); else schedule(); },
      focus(value) { focused = value; if (value && !settle) stop(); else schedule(); },
      refresh() { if (settings.current.disabled) { finish(true); settle = null; stop(); } else schedule(); },
    };
    controller.current = api;
    const visibility = () => {
      visible = !document.hidden;
      if (!visible) { finish(true); if (settle) complete(); stop(); } else schedule();
    };
    const motion = () => { reduced = media.matches; if (reduced) { if (settle) complete(); stop(); } else schedule(); };
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) { finish(true); if (settle) complete(); stop(); } else schedule();
    }, { threshold: .1 }) : null;
    const touchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) { touchId = null; finish(true); return; }
      const touch = event.touches[0];
      if (api.start(touch.clientX, touch.clientY)) touchId = touch.identifier;
    };
    const touchMove = (event: TouchEvent) => {
      if (touchId === null) return;
      const touch = Array.from(event.touches).find(item => item.identifier === touchId);
      if (!touch) return;
      if (api.move(touch.clientX, touch.clientY)) {
        if (event.cancelable) event.preventDefault(); else { touchId = null; finish(true); }
      }
    };
    const touchEnd = (event: TouchEvent) => {
      if (touchId !== null && Array.from(event.changedTouches).some(item => item.identifier === touchId)) {
        touchId = null; finish(event.type === 'touchcancel');
      }
    };
    paint(angle); observer?.observe(element); schedule();
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', motion);
    surface.addEventListener('touchstart', touchStart, { passive: true });
    surface.addEventListener('touchmove', touchMove, { passive: false });
    surface.addEventListener('touchend', touchEnd);
    surface.addEventListener('touchcancel', touchEnd);
    return () => {
      disposed = true; stop(); controller.current = null; observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', motion);
      surface.removeEventListener('touchstart', touchStart); surface.removeEventListener('touchmove', touchMove);
      surface.removeEventListener('touchend', touchEnd); surface.removeEventListener('touchcancel', touchEnd);
    };
    // The long-lived engine reads changing options from settings; selection is
    // synchronized separately so parent renders never restart idle animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { controller.current?.sync(selected); }, [selected]);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) return;
    if (controller.current?.start(event.clientX, event.clientY)) activePointer.current = event.pointerId;
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    if (controller.current?.move(event.clientX, event.clientY)) {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  };
  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    controller.current?.finish(event.type !== 'pointerup');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let index: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = wrapLookIndex(selected + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = wrapLookIndex(selected - 1);
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = 7;
    else return;
    event.preventDefault(); controller.current?.select(index);
    root.current?.querySelector<HTMLButtonElement>(`[data-look-index="${index}"]`)?.focus({ preventScroll: true });
  };

  return <div ref={root} className="outfit-wheel" role="group" aria-label={ariaLabel} aria-disabled={disabled || undefined}
    onPointerEnter={event => { if (event.pointerType !== 'touch') controller.current?.hover(true); }}
    onPointerLeave={event => { if (event.pointerType !== 'touch') controller.current?.hover(false); }}
    onFocusCapture={() => controller.current?.focus(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) controller.current?.focus(false); }}>
    <p id={id('instructions')} className="outfit-wheel__sr">Tap a numbered handle or drag and release to choose a look. Arrow keys choose the previous or next look. Automatic rotation never changes the outfit.</p>
    <div ref={stage} className="outfit-wheel__stage" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd} onKeyDown={keyDown}
      onClickCapture={event => {
        const point = suppressClickAt.current;
        const ghost = event.detail > 0 && point && performance.now() < suppressClickUntil.current && Math.hypot(event.clientX - point.x, event.clientY - point.y) < 28;
        suppressClickUntil.current = 0; suppressClickAt.current = null;
        if (ghost) { event.preventDefault(); event.stopPropagation(); }
      }}>
      <div ref={rotor} className="outfit-wheel__rotor">
        <svg className="outfit-wheel__metal" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <linearGradient id={id('rim')} x1="68" y1="45" x2="304" y2="347" gradientUnits="userSpaceOnUse"><stop stopColor="#f3f2e9"/><stop offset=".15" stopColor="#96958f"/><stop offset=".28" stopColor="#dedbd3"/><stop offset=".48" stopColor="#41413d"/><stop offset=".68" stopColor="#92928a"/><stop offset=".85" stopColor="#383b36"/><stop offset="1" stopColor="#c4c2b7"/></linearGradient>
            <linearGradient id={id('spoke')} x1="191" y1="90" x2="208" y2="93" gradientUnits="userSpaceOnUse"><stop stopColor="#252723"/><stop offset=".28" stopColor="#b4b3a7"/><stop offset=".48" stopColor="#e8e5db"/><stop offset=".67" stopColor="#9a9b90"/><stop offset="1" stopColor="#4b4d43"/></linearGradient>
            <radialGradient id={id('hub')} cx=".32" cy=".2" r=".85"><stop stopColor="#f3f1e7"/><stop offset=".3" stopColor="#b8b6a7"/><stop offset=".6" stopColor="#6a6b5f"/><stop offset=".8" stopColor="#393d33"/><stop offset="1" stopColor="#a4a38e"/></radialGradient>
            <linearGradient id={id('black')} x1="170" y1="162" x2="230" y2="244" gradientUnits="userSpaceOnUse"><stop stopColor="#363831"/><stop offset=".5" stopColor="#171c15"/><stop offset="1" stopColor="#0c100b"/></linearGradient>
          </defs>
          <g transform="translate(0 7)" fill="none" stroke="#081006"><circle cx="200" cy="200" r="126" strokeWidth="25"/>{positions.map((_, index) => <path key={index} d="M200 154V40" strokeWidth="17" strokeLinecap="round" transform={`rotate(${index * 45} 200 200)`}/>)}</g>
          {positions.map((_, index) => <g key={index} transform={`rotate(${index * 45} 200 200)`}><path d="M192 153 192 51Q200 44 208 51L208 153Z" fill={`url(#${id('spoke')})`} stroke="#dfe8cf33" strokeWidth="1"/><path d="M197 146V58" stroke="#f2f4dd66" strokeWidth="1"/></g>)}
          <circle cx="200" cy="200" r="126" fill="none" stroke="#0b1609" strokeWidth="27"/>
          <circle cx="200" cy="200" r="126" fill="none" stroke={`url(#${id('rim')})`} strokeWidth="21"/>
          <circle cx="200" cy="200" r="137" fill="none" stroke="#e7edda99" strokeWidth="1.1"/>
          <circle cx="200" cy="200" r="115" fill="none" stroke="#e8efdc66" strokeWidth="1"/>
          {positions.map((_, index) => <circle key={index} cx="200" cy="74" r="2.1" fill="#12220f" stroke="#d1dec177" strokeWidth=".6" transform={`rotate(${index * 45 + 22.5} 200 200)`}/>)}
          <circle cx="200" cy="205" r="49" fill="#071005"/><circle cx="200" cy="200" r="49" fill={`url(#${id('hub')})`} stroke="#d4dec299" strokeWidth="1.2"/>
          <circle cx="200" cy="200" r="38" fill={`url(#${id('black')})`} stroke="#a8b99a88" strokeWidth="1"/><circle cx="200" cy="200" r="30" fill="none" stroke="#899c7155" strokeWidth=".5"/>
        </svg>
        {positions.map((position, index) => <button key={looks[index]?.id ?? index} type="button" className="outfit-wheel__ball" data-look-index={index}
          style={{ '--ow-x': position.x, '--ow-y': position.y } as CSSProperties}
          aria-label={`Look ${String(index + 1).padStart(2, '0')}: ${looks[index]?.name ?? 'Unavailable look'}`}
          aria-describedby={id('instructions')} aria-pressed={selected === index} tabIndex={selected === index ? 0 : -1}
          disabled={disabled || !looks[index]} onClick={() => controller.current?.select(index)}>
          <span className="outfit-wheel__number">{String(index + 1).padStart(2, '0')}</span>
        </button>)}
      </div>
      <div className="outfit-wheel__hub" aria-hidden="true"><strong>H.</strong><span>FIT INDEX</span></div>
      <span className="outfit-wheel__marker" aria-hidden="true"/>
    </div>
    <div className="outfit-wheel__utility"><p className="outfit-wheel__hint">ROTATE. FIND YOUR FIT.</p>{autoRotate && <button type="button" className="outfit-wheel__motion" disabled={disabled} aria-label={userPaused ? 'Resume automatic wheel rotation' : 'Pause automatic wheel rotation'} aria-pressed={!userPaused} onClick={() => setUserPaused(value => !value)}>{userPaused ? <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1 11 6 3 11Z"/></svg> : <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1H5V11H2ZM8 1H11V11H8Z"/></svg>}</button>}</div>
    <span className="outfit-wheel__sr" role="status" aria-live="polite" aria-atomic="true">Look {selected + 1} of 8: {looks[selected]?.name ?? 'Unavailable look'}</span>
  </div>;
}

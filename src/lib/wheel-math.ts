export const WHEEL_LOOK_COUNT = 8;
export const WHEEL_DETENT_DEG = 45;

export function normalizeAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return ((angle % 360) + 360) % 360;
}

export function wrapLookIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return ((Math.trunc(index) % WHEEL_LOOK_COUNT) + WHEEL_LOOK_COUNT) % WHEEL_LOOK_COUNT;
}

/** Signed shortest pointer delta; crossing 359/0 never produces a full turn. */
export function angularDelta(from: number, to: number): number {
  const delta = normalizeAngle(to - from + 180) - 180;
  return delta === -180 ? 180 : delta;
}

export function pointerAngle(x: number, y: number, centerX: number, centerY: number): number {
  return Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
}

export function snapRotation(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  // Explicit positive tie handling, including negative angles.
  return Math.floor(angle / WHEEL_DETENT_DEG + 0.5) * WHEEL_DETENT_DEG;
}

/** A negative body rotation brings clockwise-numbered ball N to the top. */
export function rotationForLook(index: number): number {
  return -wrapLookIndex(index) * WHEEL_DETENT_DEG;
}

export function lookForRotation(angle: number): number {
  return wrapLookIndex(-snapRotation(angle) / WHEEL_DETENT_DEG);
}

export function nearestEquivalentRotation(target: number, current: number): number {
  return current + angularDelta(current, target);
}

/** Decorative idle rotation is deliberately absent from selection math. */
export function lookAfterDrag(selectedIndex: number, dragDelta: number, inertiaDelta = 0): number {
  return lookForRotation(rotationForLook(selectedIndex) + dragDelta + inertiaDelta);
}

export function inertiaProjection(velocityDegPerMs: number, ageMs: number): number {
  if (!Number.isFinite(velocityDegPerMs) || ageMs > 100) return 0;
  return Math.max(-22, Math.min(22, velocityDegPerMs * 100));
}

import { describe, expect, it } from 'vitest';
import { angularDelta, inertiaProjection, lookAfterDrag, lookForRotation, nearestEquivalentRotation, normalizeAngle, pointerAngle, rotationForLook, snapRotation, wrapLookIndex } from '../src/lib/wheel-math';

describe('eight-spoke wheel geometry', () => {
  it('normalizes negative and multiple-turn angles', () => {
    expect(normalizeAngle(-45)).toBe(315);
    expect(normalizeAngle(1081)).toBe(1);
    expect(normalizeAngle(-720)).toBe(0);
    expect(normalizeAngle(Infinity)).toBe(0);
  });
  it('handles pointer crossings without a full-turn jump', () => {
    expect(angularDelta(359, 1)).toBe(2);
    expect(angularDelta(1, 359)).toBe(-2);
    expect(angularDelta(-179, 179)).toBe(-2);
    expect(angularDelta(179, -179)).toBe(2);
  });
  it('uses the pointer angle around the actual center', () => {
    expect(pointerAngle(100, 0, 100, 100)).toBe(-90);
    expect(pointerAngle(200, 100, 100, 100)).toBe(0);
    expect(pointerAngle(100, 200, 100, 100)).toBe(90);
  });
  it('snaps to 45-degree detents with deterministic half-way ties', () => {
    expect(snapRotation(22.49)).toBe(0);
    expect(snapRotation(22.5)).toBe(45);
    expect(snapRotation(-22.5)).toBe(0);
    expect(snapRotation(-22.51)).toBe(-45);
    expect(snapRotation(405)).toBe(405);
  });
  it('roundtrips every ball index at any whole-turn offset', () => {
    for (let index = 0; index < 8; index++) {
      for (const turns of [-3, 0, 4]) expect(lookForRotation(rotationForLook(index) + 360 * turns)).toBe(index);
    }
    expect(wrapLookIndex(-1)).toBe(7);
    expect(wrapLookIndex(8)).toBe(0);
  });
  it('chooses the nearest equivalent visual rotation', () => {
    expect(nearestEquivalentRotation(0, 359)).toBe(360);
    expect(nearestEquivalentRotation(-315, 40)).toBe(45);
    expect(nearestEquivalentRotation(45, 760)).toBe(765);
  });
  it('advances one look for a one-spoke drag, independently of idle phase', () => {
    expect(lookAfterDrag(0, 45)).toBe(7);
    expect(lookAfterDrag(0, -45)).toBe(1);
    expect(lookAfterDrag(5, 45)).toBe(4);
    expect(lookAfterDrag(7, -45)).toBe(0);
    expect(lookAfterDrag(3, -360 - 45)).toBe(4);
  });
  it('limits release momentum and ignores a stale velocity sample', () => {
    expect(inertiaProjection(3, 10)).toBe(22);
    expect(inertiaProjection(-3, 10)).toBe(-22);
    expect(inertiaProjection(0.1, 10)).toBe(10);
    expect(inertiaProjection(1, 101)).toBe(0);
    expect(lookAfterDrag(0, 45, inertiaProjection(1, 0))).toBe(7);
  });
});

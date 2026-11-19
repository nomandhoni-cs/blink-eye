#!/usr/bin/env python3
"""Approximate sample size for one fixed-horizon two-arm binary A/B test."""

import argparse
import json
import math
from statistics import NormalDist


def finite_number(text):
    try:
        value = float(text)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("must be a number") from exc
    if not math.isfinite(value):
        raise argparse.ArgumentTypeError("must be finite")
    return value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", type=finite_number, required=True,
                        help="control outcome rate as a proportion (0.20 for 20%%)")
    parser.add_argument("--delta", type=finite_number, required=True,
                        help="absolute rate change (0.03 for +3 percentage points)")
    parser.add_argument("--alpha", type=finite_number, default=0.05,
                        help="two-sided significance level (default: 0.05)")
    parser.add_argument("--power", type=finite_number, default=0.80,
                        help="desired power from 0.50 up to 1, exclusive (default: 0.80)")
    parser.add_argument("--eligible-per-week", type=finite_number,
                        help="distinct eligible units per week across both arms")
    parser.add_argument("--follow-up-days", type=finite_number, default=0.0,
                        help="days from assignment to mature primary outcome (default: 0)")
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = parser.parse_args()

    p0, p1 = args.baseline, args.baseline + args.delta
    if not 0 < p0 < 1:
        parser.error("--baseline must be strictly between 0 and 1")
    if not 0 < p1 < 1:
        parser.error("--baseline + --delta must be strictly between 0 and 1")
    if p1 == p0:
        parser.error("--delta must produce a nonzero change at this precision")
    if not 0 < args.alpha < 1:
        parser.error("--alpha must be strictly between 0 and 1")
    if not 0.5 <= args.power < 1 or args.power <= args.alpha:
        parser.error("--power must be in [0.5, 1) and greater than --alpha")
    if args.eligible_per_week is not None and args.eligible_per_week <= 0:
        parser.error("--eligible-per-week must be positive")
    if args.follow_up_days < 0:
        parser.error("--follow-up-days must not be negative")

    normal = NormalDist()
    mean = (p0 + p1) / 2
    try:
        z_alpha = -normal.inv_cdf(args.alpha / 2)
        z_power = normal.inv_cdf(args.power)
        variance0 = 2 * mean * (1 - mean)
        variance1 = p0 * (1 - p0) + p1 * (1 - p1)
        n_arm = math.ceil(((z_alpha * math.sqrt(variance0) + z_power * math.sqrt(variance1)) / abs(p1 - p0)) ** 2)
    except (OverflowError, ValueError, ArithmeticError):
        parser.error("inputs are too extreme for this approximation")
    total = 2 * n_arm
    enrollment = total / args.eligible_per_week if args.eligible_per_week else None
    readout = None if enrollment is None else enrollment + args.follow_up_days / 7
    if readout is not None and not math.isfinite(readout):
        parser.error("traffic or follow-up is too extreme for a finite calendar estimate")
    relative_percent = args.delta * 100 / p0
    if not math.isfinite(relative_percent):
        parser.error("baseline is too small to report finite relative lift")
    notes = [
        "Approximation for independent assignments, two equal arms, one binary outcome, and a fixed horizon.",
        "Does not adjust for clustering, missing data, multiple testing, or sequential monitoring.",
        "Guardrails may need a separate baseline and sample-size calculation.",
    ]
    if min(n_arm * p0, n_arm * (1 - p0), n_arm * p1, n_arm * (1 - p1)) < 5:
        notes.append("Rare outcomes: normal approximation may be unreliable; use an exact method or simulation.")
    result = dict(baseline_rate=p0, target_rate=p1, absolute_delta_pp=round(args.delta * 100, 10),
                  relative_lift_percent=round(relative_percent, 10),
                  alpha=args.alpha, power=args.power, users_per_arm=n_arm, total_users=total,
                  eligible_per_week=args.eligible_per_week, enrollment_weeks=enrollment,
                  follow_up_days=args.follow_up_days, readout_weeks=readout, notes=notes)
    if args.json:
        print(json.dumps(result, indent=2, allow_nan=False))
        return
    print(f"{n_arm:,} units per arm ({total:,} total)")
    print(f"Baseline {p0:.4%} → target {p1:.4%} ({args.delta * 100:+g} percentage points; "
          f"{relative_percent:+.4g}% relative)")
    print(f"Two-sided alpha {args.alpha:g}; power {args.power:.0%}")
    if enrollment is not None:
        print(f"About {enrollment:.2f} weeks to enroll and {readout:.2f} weeks to the first full readout "
              f"including {args.follow_up_days:g} follow-up days after the last assignment.")
    elif args.follow_up_days:
        print(f"Allow {args.follow_up_days:g} follow-up days after the last assignment.")
    for note in notes:
        print(f"- {note}")


if __name__ == "__main__":
    main()

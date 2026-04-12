/**
 * Matching Service — data-driven matching based on live profile values
 */

type ParentForMatching = {
  latitude: number | null;
  longitude: number | null;
  requiredDays: string | null;
  minBudget: number | null;
  maxBudget: number | null;
  children: Array<{ stubbornnessLvl: number | null }>;
};

type SitterForMatching = {
  id: string;
  userId: string;
  bio: string | null;
  experienceYears: number;
  hourlyRate: number;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  averageRating: number;
  totalRatings: number;
  badges: string | string[] | null;
  user: { id: string; name: string | null; email: string; profilePicture: string | null; phoneNumber: string | null };
  availabilities: Array<{ dayOfWeek: string }>;
  certifications: unknown[];
};

type FactorName = "location" | "availability" | "budget" | "personality" | "experience" | "rating";

export type MatchContext = {
  maxDistanceKm: number;
  maxExperienceYears: number;
  maxRating: number;
  locationCoverage: number;
  availabilityCoverage: number;
  parentRequiredDays: string[];
  parentHasLocation: boolean;
  parentHasBudget: boolean;
  parentHasChildren: boolean;
  normalizedMinBudget: number;
  normalizedMaxBudget: number;
};

const hasNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const roundTo2 = (value: number): number => Math.round(value * 100) / 100;

const normalizeDays = (requiredDays: string | null): string[] => {
  if (!requiredDays) return [];
  const days = requiredDays
    .split(",")
    .map((day) => day.trim().toUpperCase())
    .filter((day) => day.length > 0);
  return Array.from(new Set(days));
};

const getAverageStubbornness = (children: Array<{ stubbornnessLvl: number | null }>): number | null => {
  const levels = children
    .map((child) => child.stubbornnessLvl)
    .filter((level): level is number => hasNumber(level) && level > 0);

  if (levels.length === 0) return null;
  return levels.reduce((sum, level) => sum + level, 0) / levels.length;
};

// ── Haversine distance (km) ──
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const buildMatchContext = (
  parent: ParentForMatching,
  sitters: SitterForMatching[]
): MatchContext => {
  const parentHasLocation = hasNumber(parent.latitude) && hasNumber(parent.longitude);
  const parentRequiredDays = normalizeDays(parent.requiredDays);

  const rawMinBudget = hasNumber(parent.minBudget) ? parent.minBudget : 0;
  const rawMaxBudget = hasNumber(parent.maxBudget) ? parent.maxBudget : 0;
  const normalizedMinBudget = Math.min(rawMinBudget, rawMaxBudget);
  const normalizedMaxBudget = Math.max(rawMinBudget, rawMaxBudget);
  const parentHasBudget = normalizedMaxBudget > 0;
  const parentHasChildren = getAverageStubbornness(parent.children) !== null;

  const validDistanceValues = parentHasLocation
    ? sitters
        .filter((sitter) => hasNumber(sitter.latitude) && hasNumber(sitter.longitude))
        .map((sitter) =>
          calculateDistance(parent.latitude as number, parent.longitude as number, sitter.latitude as number, sitter.longitude as number)
        )
        .filter((distance) => Number.isFinite(distance))
    : [];

  const maxDistanceKm =
    validDistanceValues.length > 0
      ? validDistanceValues.reduce((max, value) => (value > max ? value : max), 0)
      : 0;

  const maxExperienceYears =
    sitters.length > 0
      ? sitters.reduce((max, sitter) => (sitter.experienceYears > max ? sitter.experienceYears : max), 0)
      : 0;

  const ratedSitters = sitters.filter((sitter) => sitter.totalRatings > 0 && hasNumber(sitter.averageRating));
  const maxRating =
    ratedSitters.length > 0
      ? ratedSitters.reduce((max, sitter) => (sitter.averageRating > max ? sitter.averageRating : max), 0)
      : 0;

  const locationCoverage =
    sitters.length > 0
      ? sitters.filter((sitter) => hasNumber(sitter.latitude) && hasNumber(sitter.longitude)).length / sitters.length
      : 0;

  const availabilityCoverage =
    sitters.length > 0
      ? sitters.filter((sitter) => Array.isArray(sitter.availabilities) && sitter.availabilities.length > 0).length / sitters.length
      : 0;

  return {
    maxDistanceKm,
    maxExperienceYears,
    maxRating,
    locationCoverage,
    availabilityCoverage,
    parentRequiredDays,
    parentHasLocation,
    parentHasBudget,
    parentHasChildren,
    normalizedMinBudget,
    normalizedMaxBudget,
  };
};

// ── Compute match result for one sitter against a parent ──
export const computeMatch = (
  parent: ParentForMatching,
  sitter: SitterForMatching,
  context: MatchContext
) => {
  const locationScore =
    context.parentHasLocation && hasNumber(sitter.latitude) && hasNumber(sitter.longitude)
      ? context.maxDistanceKm > 0
        ? clamp01(
            1 -
              calculateDistance(
                parent.latitude as number,
                parent.longitude as number,
                sitter.latitude as number,
                sitter.longitude as number
              ) /
                context.maxDistanceKm
          )
        : 1
      : null;

  const availabilityScore =
    context.parentRequiredDays.length === 0
      ? null
      : sitter.availabilities.length === 0
        ? 0
        : (() => {
            const availableDays = new Set(
              sitter.availabilities.map((slot) => slot.dayOfWeek.trim().toUpperCase()).filter((day) => day.length > 0)
            );
            const matched = context.parentRequiredDays.filter((day) => availableDays.has(day));
            return matched.length / context.parentRequiredDays.length;
          })();

  const budgetScore = (() => {
    if (!context.parentHasBudget || !hasNumber(sitter.hourlyRate)) return null;
    if (sitter.hourlyRate >= context.normalizedMinBudget && sitter.hourlyRate <= context.normalizedMaxBudget) {
      return 1;
    }

    const outsideDistance =
      sitter.hourlyRate < context.normalizedMinBudget
        ? context.normalizedMinBudget - sitter.hourlyRate
        : sitter.hourlyRate - context.normalizedMaxBudget;

    const budgetSpread = context.normalizedMaxBudget - context.normalizedMinBudget;
    const normalizationBase = Math.max(
      budgetSpread,
      context.normalizedMaxBudget,
      context.normalizedMinBudget,
      sitter.hourlyRate
    );
    if (normalizationBase <= 0) return null;
    return clamp01(1 - outsideDistance / normalizationBase);
  })();

  const personalityScore = (() => {
    const avgStubbornness = getAverageStubbornness(parent.children);
    if (avgStubbornness === null) return null;
    const experience = Math.max(0, sitter.experienceYears);
    const demand = Math.max(0, avgStubbornness);
    if (experience === 0 && demand === 0) return null;
    return clamp01(experience / (experience + demand));
  })();

  const experienceScore =
    context.maxExperienceYears > 0 ? clamp01(Math.max(0, sitter.experienceYears) / context.maxExperienceYears) : null;

  const ratingScore =
    sitter.totalRatings > 0 && context.maxRating > 0 ? clamp01(Math.max(0, sitter.averageRating) / context.maxRating) : null;

  const rawScores: Record<FactorName, number | null> = {
    location: locationScore,
    availability: availabilityScore,
    budget: budgetScore,
    personality: personalityScore,
    experience: experienceScore,
    rating: ratingScore,
  };

  const baseWeights: Record<FactorName, number> = {
    location: context.parentHasLocation ? context.locationCoverage : 0,
    availability: context.parentRequiredDays.length > 0 ? context.availabilityCoverage : 0,
    budget: context.parentHasBudget ? 1 : 0,
    personality: context.parentHasChildren ? 1 : 0,
    experience: context.maxExperienceYears > 0 ? 1 : 0,
    rating: context.maxRating > 0 ? 1 : 0,
  };

  const activeFactors = (Object.entries(rawScores) as Array<[FactorName, number | null]>).filter(
    (entry): entry is [FactorName, number] => entry[1] !== null
  );

  let totalScore = 0;
  if (activeFactors.length > 0) {
    const weightedBase = activeFactors.reduce((sum, [factor]) => sum + baseWeights[factor], 0);

    if (weightedBase > 0) {
      totalScore = activeFactors.reduce(
        (sum, [factor, score]) => sum + score * (baseWeights[factor] / weightedBase),
        0
      );
    } else {
      const equalWeight = 1 / activeFactors.length;
      totalScore = activeFactors.reduce((sum, [, score]) => sum + score * equalWeight, 0);
    }
  }

  return {
    sitter: {
      id: sitter.id,
      userId: sitter.userId,
      name: sitter.user.name,
      email: sitter.user.email,
      profilePicture: sitter.user.profilePicture,
      phoneNumber: sitter.user.phoneNumber,
      bio: sitter.bio,
      experienceYears: sitter.experienceYears,
      hourlyRate: sitter.hourlyRate,
      locationAddress: sitter.locationAddress,
      latitude: sitter.latitude,
      longitude: sitter.longitude,
      averageRating: sitter.averageRating,
      totalRatings: sitter.totalRatings,
      badges: sitter.badges,
      availabilities: sitter.availabilities,
      certifications: sitter.certifications,
    },
    matchScore: roundTo2(totalScore),
    factorScores: {
      location: roundTo2(locationScore ?? 0),
      availability: roundTo2(availabilityScore ?? 0),
      budget: roundTo2(budgetScore ?? 0),
      personality: roundTo2(personalityScore ?? 0),
      experience: roundTo2(experienceScore ?? 0),
      rating: roundTo2(ratingScore ?? 0),
    },
  };
};

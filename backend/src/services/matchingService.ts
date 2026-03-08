/**
 * Matching Service — 7-Factor Smart Matching Algorithm (pure business logic)
 */

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

// ── Availability match score (0–1) ──
export const checkAvailabilityMatch = (
  parentRequiredDays: string | null,
  sitterAvailabilities: Array<{ dayOfWeek: string }> | undefined
): number => {
  if (!parentRequiredDays || !sitterAvailabilities?.length) return 0.5;
  const requiredDays = parentRequiredDays.split(",").map((d) => d.trim().toUpperCase());
  const availableDays = sitterAvailabilities.map((a) => a.dayOfWeek.toUpperCase());
  const matchedDays = requiredDays.filter((day) => availableDays.includes(day));
  return matchedDays.length / requiredDays.length;
};

// ── Budget match score (0–1) ──
export const checkBudgetMatch = (
  parentMinBudget: number | null,
  parentMaxBudget: number | null,
  sitterRate: number | null
): number => {
  if (!parentMinBudget || !parentMaxBudget || !sitterRate) return 0.5;
  const minBudget = parseFloat(parentMinBudget.toString());
  const maxBudget = parseFloat(parentMaxBudget.toString());
  const rate = parseFloat(sitterRate.toString());
  if (rate >= minBudget && rate <= maxBudget) return 1.0;
  if (rate < minBudget) return 0.3;
  if (rate > maxBudget * 1.2) return 0.1;
  return 0.6;
};

// ── Personality match (stubbornness vs experience) ──
export const checkPersonalityMatch = (childStubbornness: number, sitterExperience: number): number => {
  const stubbornness = childStubbornness || 1;
  const experience = sitterExperience || 0;
  if (stubbornness >= 4 && experience >= 3) return 1.0;
  if (stubbornness >= 3 && experience >= 2) return 0.8;
  if (stubbornness <= 2 && experience >= 1) return 0.9;
  return 0.5;
};

// ── Factor weights ──
const WEIGHTS = {
  location: 0.2,
  availability: 0.2,
  budget: 0.15,
  personality: 0.15,
  experience: 0.1,
  rating: 0.15,
  days: 0.05,
};

// ── Compute match result for one sitter against a parent ──
export const computeMatch = (
  parent: {
    latitude: number | null;
    longitude: number | null;
    requiredDays: string | null;
    minBudget: number | null;
    maxBudget: number | null;
    children: Array<{ stubbornnessLvl: number | null }>;
  },
  sitter: {
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
  }
) => {
  let locationScore = 0.5;
  if (parent.latitude && parent.longitude && sitter.latitude && sitter.longitude) {
    const distance = calculateDistance(parent.latitude, parent.longitude, sitter.latitude, sitter.longitude);
    locationScore = Math.max(0, 1 - distance / 50);
  }

  const availabilityScore = checkAvailabilityMatch(parent.requiredDays, sitter.availabilities);
  const budgetScore = checkBudgetMatch(parent.minBudget, parent.maxBudget, sitter.hourlyRate);

  const avgStubbornness =
    parent.children.length > 0
      ? parent.children.reduce((sum, child) => sum + (child.stubbornnessLvl || 1), 0) / parent.children.length
      : 1;
  const personalityScore = checkPersonalityMatch(avgStubbornness, sitter.experienceYears);
  const experienceScore = Math.min(sitter.experienceYears / 10, 1.0);
  const ratingScore = sitter.averageRating / 5.0;
  const daysScore = availabilityScore;

  const totalScore =
    locationScore * WEIGHTS.location +
    availabilityScore * WEIGHTS.availability +
    budgetScore * WEIGHTS.budget +
    personalityScore * WEIGHTS.personality +
    experienceScore * WEIGHTS.experience +
    ratingScore * WEIGHTS.rating +
    daysScore * WEIGHTS.days;

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
    matchScore: Math.round(totalScore * 100) / 100,
    factorScores: {
      location: Math.round(locationScore * 100) / 100,
      availability: Math.round(availabilityScore * 100) / 100,
      budget: Math.round(budgetScore * 100) / 100,
      personality: Math.round(personalityScore * 100) / 100,
      experience: Math.round(experienceScore * 100) / 100,
      rating: Math.round(ratingScore * 100) / 100,
    },
  };
};

// ── Filter & sort matches above threshold ──
export const MATCH_THRESHOLD = 0.3;

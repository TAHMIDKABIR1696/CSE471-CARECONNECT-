import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface AdminData {
  name: string;
  email: string;
  password: string;
}

interface ParentData {
  name: string;
  email: string;
  password: string;
  stubbornnessLvl: number | null;
  daysNeeded: string | null;
  minBudget: number;
  maxBudget: number;
  about: string;
}

interface SitterData {
  name: string;
  email: string;
  password: string;
  location: string;
  lat: number;
  lng: number;
  active: boolean;
  daysFree: number | null;
}

async function main(): Promise<void> {
  console.log("🌱 Seeding CareConnect database...\n");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.activityLog.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.child.deleteMany();
  await prisma.sOSAlert.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.babysitter.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.classLink.deleteMany();
  await prisma.consultationSlot.deleteMany();
  await prisma.sitterRecord.deleteMany();
  await prisma.user.deleteMany();

  const SALT_ROUNDS = 10;

  // --- Admin Users ---
  console.log("👤 Creating admin users...");
  const adminData: AdminData[] = [
    { name: "Mahmud Admin", email: "Mahmud.Admin@gmail.com", password: "Mahmud@#1234" },
    { name: "Tanvir Ahmed", email: "tanvir@admin.careconnect.com", password: "tanvir@123" },
    { name: "Mariam Hossain", email: "mariam@admin.careconnect.com", password: "mariamPass" },
    { name: "Rafiul Islam", email: "rafiul@admin.careconnect.com", password: "rafiul321" },
    { name: "Nazia Karim", email: "nazia@admin.careconnect.com", password: "naziaSecure" },
  ];

  const admins = [];
  for (const admin of adminData) {
    const hashedPassword = await bcrypt.hash(admin.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: "ADMIN",
        isApproved: true,
        isVerified: true,
      },
    });
    admins.push(user);
  }
  console.log(`  ✅ Created ${admins.length} admins`);

  // --- Parent Users ---
  console.log("👨‍👩‍👧 Creating parent users...");
  const parentData: ParentData[] = [
    { name: "Farzana Rahman", email: "farzana.rahman@careconnect.com", password: "pass123", stubbornnessLvl: 2, daysNeeded: "Mon,Wed,Fri", minBudget: 3000, maxBudget: 5000, about: "Single mother looking for part-time help." },
    { name: "Shafiq Islam", email: "shafiq.islam@careconnect.com", password: "safe456", stubbornnessLvl: 3, daysNeeded: "Mon,Tue,Wed,Thu,Fri", minBudget: 5000, maxBudget: 7000, about: "Working dad with twins." },
    { name: "Nasima Khatun", email: "nasima.khatun@careconnect.com", password: "nasima789", stubbornnessLvl: 1, daysNeeded: "Sat,Sun", minBudget: 2000, maxBudget: 3000, about: "Needs occasional babysitting on weekends." },
    { name: "Jamal Uddin", email: "jamal.uddin@careconnect.com", password: "jamal456", stubbornnessLvl: 4, daysNeeded: "Mon,Tue,Wed,Thu,Fri,Sat", minBudget: 6000, maxBudget: 8000, about: "Strict but caring parent of 3." },
    { name: "Tania Karim", email: "tania.karim@careconnect.com", password: "tania999", stubbornnessLvl: 2, daysNeeded: "Mon,Tue,Wed,Thu", minBudget: 4000, maxBudget: 6000, about: "Remote worker, needs help during meetings." },
    { name: "Raihan Kabir", email: "raihan.kabir@careconnect.com", password: "raihan123", stubbornnessLvl: null, daysNeeded: null, minBudget: 0, maxBudget: 0, about: "Busy professional seeking reliable care." },
    { name: "Sadia Alam", email: "sadia.alam@careconnect.com", password: "sadia456", stubbornnessLvl: null, daysNeeded: null, minBudget: 0, maxBudget: 0, about: "First-time parent needing guidance." },
    { name: "Lamia Mahzabin", email: "lamia.mahzabin@careconnect.com", password: "lamia789", stubbornnessLvl: null, daysNeeded: null, minBudget: 0, maxBudget: 0, about: "Doctor with irregular schedule." },
  ];

  const parents = [];
  for (const p of parentData) {
    const hashedPassword = await bcrypt.hash(p.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        password: hashedPassword,
        role: "PARENT",
        isApproved: true,
        isVerified: true,
      },
    });
    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        situation: p.about,
        minBudget: p.minBudget,
        maxBudget: p.maxBudget,
        requiredDays: p.daysNeeded,
      },
    });
    parents.push({ user, parent });
  }
  console.log(`  ✅ Created ${parents.length} parents`);

  // --- Babysitter Users ---
  console.log("👶 Creating babysitter users...");
  const sitterData: SitterData[] = [
    { name: "Munim Hasan", email: "munim.hasan@gmail.com", password: "Pass123", location: "Dhaka", lat: 23.80452690, lng: 90.39803982, active: true, daysFree: 12 },
    { name: "Isha Rahman", email: "isha.rahman@gmail.com", password: "Pass124", location: "Dhaka", lat: 23.80530000, lng: 90.41750000, active: false, daysFree: null },
    { name: "Mahmud Khan", email: "mahmud.khan@gmail.com", password: "Pass125", location: "Dhaka", lat: 23.81530000, lng: 90.40750000, active: false, daysFree: null },
    { name: "Habiba Sultana", email: "habiba.sultana@gmail.com", password: "Pass126", location: "Dhaka", lat: 23.81230000, lng: 90.41550000, active: false, daysFree: null },
    { name: "Fardin Ahmed", email: "fardin.ahmed@gmail.com", password: "Pass127", location: "Dhaka", lat: 23.80730000, lng: 90.41050000, active: false, daysFree: null },
    { name: "Sabrina Akter", email: "sabrina.akter@gmail.com", password: "Pass128", location: "Dhaka", lat: 23.81330000, lng: 90.41350000, active: false, daysFree: null },
    { name: "Rifat Islam", email: "rifat.islam@gmail.com", password: "Pass129", location: "Dhaka", lat: 23.80830000, lng: 90.41650000, active: false, daysFree: null },
    { name: "Farah Noor", email: "farah.noor@gmail.com", password: "Pass130", location: "Dhaka", lat: 23.81630000, lng: 90.40850000, active: false, daysFree: null },
    { name: "Tamim Chowdhury", email: "tamim.chowdhury@gmail.com", password: "Pass131", location: "Dhaka", lat: 23.81130000, lng: 90.41150000, active: false, daysFree: null },
    { name: "Nusrat Jahan", email: "nusrat.jahan@gmail.com", password: "Pass132", location: "Dhaka", lat: 23.80450727, lng: 90.38555145, active: false, daysFree: 10 },
  ];

  const sitters = [];
  for (const s of sitterData) {
    const hashedPassword = await bcrypt.hash(s.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: "BABYSITTER",
        isApproved: true,
        isVerified: true,
      },
    });
    const babysitter = await prisma.babysitter.create({
      data: {
        userId: user.id,
        locationAddress: s.location,
        latitude: s.lat,
        longitude: s.lng,
      },
    });
    sitters.push({ user, babysitter });
  }
  console.log(`  ✅ Created ${sitters.length} babysitters`);

  // --- Sitter Records ---
  console.log("📋 Creating sitter records...");
  await prisma.sitterRecord.createMany({
    data: [
      { sitterId: 6, name: "ankan11", link: "https://youtu.be/48f7GexVGMI?si=esYsgW3wbH97SGuM" },
      { sitterId: 6, name: "ankan11", link: "https://youtu.be/ejTMnwW_3_E?si=Kp6WhbD0k3BnH36a" },
      { sitterId: 6, name: "ankan11", link: "https://youtu.be/ygmW8Y5lulo?si=wq1Sp_wlspP0Qn9d" },
    ],
  });
  console.log("  ✅ Created 3 sitter records");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Admins: ${admins.length}`);
  console.log(`   Parents: ${parents.length}`);
  console.log(`   Babysitters: ${sitters.length}`);
  console.log(`   Sitter Records: 3`);
}

main()
  .catch((e: Error) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  return res.json({
    firmName: "P and P Associates Law Firm",
    address: "Chamber No. 12, Patiala House Courts Complex",
    city: "New Delhi",
    state: "Delhi",
    zip: "110001",
    phone: "9210890993",
    phone2: "9210696173",
    email: "info@pandpassociates.in",
    hours: "Monday–Saturday: 10:00 AM – 6:00 PM | Sunday: Closed",
    mapEmbedUrl: null,
  });
});

export default router;

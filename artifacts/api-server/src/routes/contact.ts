import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  return res.json({
    firmName: "P and P Associates Law Firm",
    address: "WZ-40, M-Block, Gali No. 4, New Mahavir Nagar",
    city: "New Delhi",
    state: "Delhi",
    zip: "110018",
    phone: "9210890993",
    phone2: "9210696173",
    email: "pandpassociates5@gmail.com",
    hours: "Monday–Saturday: 10:00 AM – 6:00 PM | Sunday: Closed",
    mapEmbedUrl: null,
  });
});

export default router;

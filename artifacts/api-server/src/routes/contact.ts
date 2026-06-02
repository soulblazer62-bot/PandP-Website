import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  return res.json({
    firmName: "P and P Associates Law Firm",
    address: "1247 Justice Avenue, Suite 400",
    city: "New York",
    state: "NY",
    zip: "10001",
    phone: "+1 (212) 555-0147",
    email: "info@lexonassociates.com",
    hours: "Monday–Friday: 9:00 AM – 6:00 PM | Saturday: 10:00 AM – 2:00 PM",
    mapEmbedUrl: null,
  });
});

export default router;

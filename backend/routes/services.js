import { Router } from 'express';

const router = Router();

const services = [
  { id: 1, slug: 'passport', name: 'Passport Services', desc: 'Fresh, renewal and tatkal passport application support.', icon: 'passport', price: '₹500 onwards', duration: '7-30 days' },
  { id: 2, slug: 'pan', name: 'PAN Services', desc: 'New PAN, correction and reprint, handled end to end.', icon: 'pan', price: '₹150 onwards', duration: '5-15 days' },
  { id: 3, slug: 'aadhaar', name: 'Aadhaar Services', desc: 'Update address, mobile, biometrics, or get a fresh print.', icon: 'aadhaar', price: '₹100 onwards', duration: '3-10 days' },
  { id: 4, slug: 'pvc-id', name: 'PVC ID Cards', desc: 'Durable, professional PVC printing for ID and access cards.', icon: 'pvc', price: '₹50 onwards', duration: '2-5 days' },
  { id: 5, slug: 'driving-licence', name: 'Driving Licence', desc: 'Learner, permanent licence and renewal applications.', icon: 'licence', price: '₹300 onwards', duration: '7-20 days' },
  { id: 6, slug: 'voter-id', name: 'Voter ID', desc: 'New registration, correction and address change support.', icon: 'voter', price: '₹200 onwards', duration: '7-15 days' },
  { id: 7, slug: 'printing', name: 'Document Printing', desc: 'Sharp, high-quality black & white and color printing.', icon: 'printer', price: '₹2 onwards', duration: 'Same day' },
  { id: 8, slug: 'scanning', name: 'Document Scanning', desc: 'High resolution scanning with digital delivery.', icon: 'scanner', price: '₹5 onwards', duration: 'Same day' },
  { id: 9, slug: 'color-printing', name: 'Color Printing', desc: 'Vivid, accurate colour prints for every requirement.', icon: 'color', price: '₹10 onwards', duration: 'Same day' },
  { id: 10, slug: 'lamination', name: 'Lamination', desc: 'Protective lamination to keep your documents safe.', icon: 'lamination', price: '₹20 onwards', duration: 'Same day' },
  { id: 11, slug: 'courier', name: 'Courier & Doorstep Delivery', desc: 'Reliable courier with delivery right to your door.', icon: 'courier', price: '₹40 onwards', duration: '1-3 days' },
  { id: 12, slug: 'business-printing', name: 'Business Printing', desc: 'Bulk and business printing solutions, delivered on time.', icon: 'business', price: 'Custom quote', duration: '2-7 days' },
];

router.get('/', (req, res) => {
  res.json({ services });
});

router.get('/:slug', (req, res) => {
  const service = services.find(s => s.slug === req.params.slug);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ service });
});

export default router;

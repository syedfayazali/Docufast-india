import Database from 'better-sqlite3';

const db = new Database('/tmp/docufast.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service_type TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'Submitted',
      tracking_id TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT DEFAULT 'DocuFast Team',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed services
  const services = [
    { slug: 'passport', name: 'Passport Services', desc: 'Fresh, renewal and tatkal passport application support.', icon: 'passport' },
    { slug: 'pan', name: 'PAN Services', desc: 'New PAN, correction and reprint, handled end to end.', icon: 'pan' },
    { slug: 'aadhaar', name: 'Aadhaar Services', desc: 'Update address, mobile, biometrics, or get a fresh print.', icon: 'aadhaar' },
    { slug: 'pvc-id', name: 'PVC ID Cards', desc: 'Durable, professional PVC printing for ID and access cards.', icon: 'pvc' },
    { slug: 'driving-licence', name: 'Driving Licence', desc: 'Learner, permanent licence and renewal applications.', icon: 'licence' },
    { slug: 'voter-id', name: 'Voter ID', desc: 'New registration, correction and address change support.', icon: 'voter' },
    { slug: 'printing', name: 'Document Printing', desc: 'Sharp, high-quality black & white and color printing.', icon: 'printer' },
    { slug: 'scanning', name: 'Document Scanning', desc: 'High resolution scanning with digital delivery.', icon: 'scanner' },
    { slug: 'color-printing', name: 'Color Printing', desc: 'Vivid, accurate colour prints for every requirement.', icon: 'color' },
    { slug: 'lamination', name: 'Lamination', desc: 'Protective lamination to keep your documents safe.', icon: 'lamination' },
    { slug: 'courier', name: 'Courier & Doorstep Delivery', desc: 'Reliable courier with delivery right to your door.', icon: 'courier' },
    { slug: 'business-printing', name: 'Business Printing', desc: 'Bulk and business printing solutions, delivered on time.', icon: 'business' },
  ];

  // Seed blog posts
  const blogs = [
    {
      title: 'How to Apply for a Passport Online in India: A Complete Guide',
      slug: 'passport-online-guide',
      excerpt: 'Everything you need to know about applying for a fresh or renewal passport online, including required documents and timelines.',
      content: 'Applying for a passport in India has become significantly easier with online services. Here is a step-by-step guide...',
      category: 'Passport',
    },
    {
      title: 'PAN Card Correction: Common Mistakes and How to Fix Them',
      slug: 'pan-card-correction',
      excerpt: 'Errors on your PAN card can cause major issues. Learn the most common mistakes and how to get them corrected quickly.',
      content: 'Your PAN card is one of the most important financial documents. Errors in name, date of birth, or photograph...',
      category: 'PAN',
    },
    {
      title: 'Aadhaar Address Update: Documents You Need',
      slug: 'aadhaar-address-update',
      excerpt: 'Moving to a new city? Here is the complete list of documents accepted for Aadhaar address updates.',
      content: 'Updating your Aadhaar address is essential when you relocate. The UIDAI accepts several documents as proof of address...',
      category: 'Aadhaar',
    },
    {
      title: 'Why Doorstep Document Delivery is the Future',
      slug: 'doorstep-delivery-future',
      excerpt: 'Discover how doorstep document delivery is transforming access to government services across India.',
      content: 'In a country as vast as India, accessing government offices can be a challenge. Doorstep delivery bridges this gap...',
      category: 'Services',
    },
  ];

  const blogExists = db.prepare('SELECT COUNT(*) as c FROM blog_posts').get();
  if (blogExists.c === 0) {
    const insertBlog = db.prepare('INSERT INTO blog_posts (title, slug, excerpt, content, category) VALUES (?, ?, ?, ?, ?)');
    blogs.forEach(b => insertBlog.run(b.title, b.slug, b.excerpt, b.content, b.category));
  }
}

export default db;

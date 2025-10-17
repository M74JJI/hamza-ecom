// components/layout/PremiumFooter.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Star, 
  Heart, 
  Truck, 
  Shield, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  Gift,
  Users,
  Award,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle
} from 'lucide-react';



type FooterLink = {
  name: string;
  href: string;
  icon?: React.ElementType; // optional Lucide icon
  badge?: string;           // optional badge
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};


export default function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  // Enhanced footer sections
const footerSections: FooterSection[] = [
  {
    title: "Shop",
    links: [
      { name: "New Arrivals", href: "/new", badge: "HOT" },
      { name: "Best Sellers", href: "/bestsellers", badge: "POPULAR" },
      { name: "Men's Collection", href: "/men" },
      { name: "Women's Collection", href: "/women" },
      { name: "Sale & Offers", href: "/sale", badge: "60% OFF" },
      { name: "Limited Editions", href: "/limited" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "/contact", icon: Phone },
      { name: "Shipping Info", href: "/shipping", icon: Truck },
      { name: "Returns & Exchanges", href: "/returns" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "FAQs", href: "/faqs" },
      { name: "Track Order", href: "/track-order" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers", badge: "HIRING" },
      { name: "Sustainability", href: "/sustainability" },
      { name: "Press", href: "/press" },
      { name: "Affiliate Program", href: "/affiliate" },
      { name: "Store Locator", href: "/stores" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Disclaimer", href: "/disclaimer" },
      { name: "Accessibility", href: "/accessibility" },
    ],
  },
];


  const trustBadges = [
    { icon: Shield, text: "Secure Payment", description: "256-bit encryption" },
    { icon: Truck, text: "Free Shipping", description: "Over 500 MAD" },
    { icon: CreditCard, text: "Flexible Payment", description: "Pay in installments" },
    { icon: Clock, text: "24/7 Support", description: "Always here to help" },
    { icon: Award, text: "Premium Quality", description: "Verified products" },
    { icon: Gift, text: "Gift Services", description: "Perfect presents" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/hajzen", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/hajzen", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/hajzen", label: "Twitter" },
    { icon: Youtube, href: "https://youtube.com/hajzen", label: "YouTube" },
    { icon: MessageCircle, href: "https://tiktok.com/hajzen", label: "TikTok" },
  ];

  const contactInfo = [
    { icon: Phone, text: "+212 600-000000", href: "tel:+212600000000" },
    { icon: Mail, text: "support@hajzen.com", href: "mailto:support@hajzen.com" },
    { icon: MapPin, text: "Casablanca, Morocco", href: "#" },
    { icon: Clock, text: "Mon-Sun: 9AM-11PM", href: "#" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * 100,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, -30, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Trust Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="border-b border-gray-200/50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-12">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="text-center group"
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200/50 group-hover:border-red-300/50 transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <badge.icon className="w-8 h-8 text-red-500" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{badge.text}</h3>
                  <p className="text-gray-600 text-xs">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Brand & Contact */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Enhanced Brand Section */}
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-4"
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center shadow-2xl border border-gray-300 relative"
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-white font-bold text-2xl">H</span>
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.3, rotate: 180 }}
                    >
                      <Crown className="w-3 h-3 text-white" />
                    </motion.div>
                  </motion.div>
                  <div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      HAJZEN
                    </h2>
                    <p className="text-gray-600 text-sm font-semibold flex items-center space-x-2 mt-1">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span>PREMIUM E-COMMERCE EXPERIENCE</span>
                    </p>
                  </div>
                </motion.div>

                <p className="text-gray-700 text-lg leading-relaxed max-w-md">
                  Redefining online shopping with premium products, exceptional quality, 
                  and unparalleled customer experience. Your satisfaction is our mission.
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center space-x-3">
                  <Users className="w-5 h-5 text-red-500" />
                  <span>Get In Touch</span>
                </h3>
                <div className="space-y-3">
                  {contactInfo.map((contact, index) => (
                    <motion.a
                      key={contact.text}
                      href={contact.href}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                      <contact.icon className="w-4 h-4 text-red-500" />
                      <span>{contact.text}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="w-12 h-12 bg-white/80 hover:bg-white rounded-2xl flex items-center justify-center border border-gray-200/60 hover:border-red-300/60 transition-all duration-300 backdrop-blur-sm group shadow-lg hover:shadow-xl"
                    >
                      <social.icon className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Navigation Links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-8"
            >
              {footerSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{section.title}</span>
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors group py-1"
                        >
                          <span className="flex items-center space-x-2">
                            {link.icon && <link.icon className="w-3 h-3" />}
                            <span>{link.name}</span>
                          </span>
                          <div className="flex items-center space-x-2">
                            {link.badge && (
                              <motion.span
                                className={`px-2 py-1 text-xs rounded-full font-bold ${
                                  link.badge === 'HOT' 
                                    ? 'bg-red-500 text-white' 
                                    : link.badge === 'POPULAR'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                }`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {link.badge}
                              </motion.span>
                            )}
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 p-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl border border-red-200/50 backdrop-blur-sm shadow-lg"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Stay in the Loop 🚀
                </h3>
                <p className="text-gray-700 text-lg">
                  Get exclusive access to new collections, special offers, and insider updates.
                </p>
              </div>
              <div className="flex-1 w-full max-w-md">
                <form className="flex space-x-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-white/80 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm shadow-sm"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 shadow-lg"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>
                <p className="text-gray-500 text-xs mt-2">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 pt-8 border-t border-gray-200/50"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Copyright */}
              <div className="flex items-center space-x-4 text-gray-600 text-sm">
                <span>© {currentYear} HAJZEN. All rights reserved.</span>
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>Morocco</span>
                </div>
              </div>

              {/* Additional Links */}
              <div className="flex items-center space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Cookies
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-gray-600 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>50K+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Made With Love */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center mt-6"
            >
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
  <span>Made with</span>
  <motion.span
    animate={{ scale: [1, 1.2, 1] }}
    transition={{ duration: 1, repeat: Infinity }}
    className="inline-flex items-center align-middle"
    aria-hidden="true"
  >
    <Heart className="w-4 h-4 text-red-500" />
  </motion.span>
  <span>by HAJZEN</span>
</p>

            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center z-50 backdrop-blur-sm"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowRight className="w-6 h-6 rotate-270" />
      </motion.button>
    </footer>
  );
}
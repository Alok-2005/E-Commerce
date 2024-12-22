import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard, Truck, Clock, ShieldCheck } from 'lucide-react';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const features = [
    { icon: <CreditCard className="w-6 h-6" />, text: "Secure Payment" },
    { icon: <Truck className="w-6 h-6" />, text: "Free Shipping" },
    { icon: <Clock className="w-6 h-6" />, text: "24/7 Support" },
    { icon: <ShieldCheck className="w-6 h-6" />, text: "Money Back Guarantee" }
  ];

  return (
    <>
    <div className=' h-[0.5px] bg-teal-950'></div>
    <footer className="footer-gradient text-gray-100">
      {/* Features Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 border-b border-teal-900/20"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex flex-col items-center text-center space-y-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-3 feature-icon-bg rounded-full shadow-lg">
              {feature.icon}
            </div>
            <span className="text-sm font-medium text-teal-50">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Footer Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-4 gap-12 p-8 max-w-7xl mx-auto"
      >
        {/* Company Info */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-xl font-bold text-teal-50">ShopStyle</h3>
          <p className="text-teal-200/70 text-sm">Your one-stop destination for trendy fashion and accessories.</p>
          <div className="flex space-x-4">
            <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-teal-200/70 hover:text-teal-50 transition-colors">
              <Facebook size={20} />
            </motion.a>
            <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-teal-200/70 hover:text-teal-50 transition-colors">
              <Instagram size={20} />
            </motion.a>
            <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-teal-200/70 hover:text-teal-50 transition-colors">
              <Twitter size={20} />
            </motion.a>
            <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-teal-200/70 hover:text-teal-50 transition-colors">
              <Youtube size={20} />
            </motion.a>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-lg font-semibold text-teal-50">Quick Links</h4>
          <ul className="space-y-2">
            {['About Us', 'Shop', 'Categories', 'Blog'].map((item, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5 }}
                className="text-teal-200/70 hover:text-teal-50 cursor-pointer transition-colors"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Customer Service */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-lg font-semibold text-teal-50">Customer Service</h4>
          <ul className="space-y-2">
            {['FAQ', 'Returns', 'Shipping', 'Track Order'].map((item, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5 }}
                className="text-teal-200/70 hover:text-teal-50 cursor-pointer transition-colors"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-lg font-semibold text-teal-50">Contact Us</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-teal-200/70">
              <MapPin size={18} />
              <span>123 Fashion Street, Style City</span>
            </div>
            <div className="flex items-center space-x-3 text-teal-200/70">
              <Phone size={18} />
              <span>+1 234 567 890</span>
            </div>
            <div className="flex items-center space-x-3 text-teal-200/70">
              <Mail size={18} />
              <span>contact@shopstyle.com</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        className="border-t border-teal-900/20 p-6 text-center text-teal-200/70 text-sm"
      >
        <p>© {new Date().getFullYear()} ShopStyle. All rights reserved.</p>
      </motion.div>
    </footer>
    </>
  );
};

export default Footer;
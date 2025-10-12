import { Link } from "react-router-dom";
import { CreditCard, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Documentation", href: "/api-docs" },
        { name: "API Reference", href: "/api-docs" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
        { name: "Compliance", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Community", href: "#" },
        { name: "Status", href: "#" },
        { name: "Changelog", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PayHub Prime
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-xs">
              No-code payment integration platform. Connect your M-Pesa, Airtel Money, PayPal, and Stripe accounts. Get shareable payment links in minutes - no development required.
            </p>
            <p className="text-xs font-semibold text-foreground mb-2 max-w-xs">
              Integration Platform Notice
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">
              PayHub Prime provides checkout UI and integration tools. All payments are processed through YOUR merchant accounts (M-Pesa, PayPal, Stripe). We don't hold or process funds - we're an integration layer, not a payment processor.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-background hover:bg-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background hover:bg-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background hover:bg-accent transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background hover:bg-accent transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t">
          <div className="max-w-md">
            <h3 className="font-semibold mb-2">Subscribe to our newsletter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest updates on features and releases.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" type="email" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} PayHub Prime. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

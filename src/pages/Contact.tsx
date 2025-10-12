import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, Linkedin, Github } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "fredrickmureti612@gmail.com",
      link: "mailto:fredrickmureti612@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone / WhatsApp",
      content: "+254 797 504 827",
      link: "tel:+254797504827",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Let's Connect</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about PayHub Prime? Want to collaborate or discuss payment integration? 
              Feel free to reach out!
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {contactInfo.map((info) => (
                <a
                  key={info.title}
                  href={info.link}
                  className="flex items-start gap-4 p-6 rounded-xl bg-card border hover:shadow-lg hover:border-primary/50 transition-all"
                >
                  <div className="p-3 rounded-lg bg-primary/10">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold mb-2">{info.title}</div>
                    <div className="text-muted-foreground">{info.content}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border">
              <h2 className="text-2xl font-bold mb-4">Let's Network!</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Connect with me on social platforms or reach out directly. I'm always open to 
                discussing payment integration, development opportunities, or collaboration.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://linkedin.com/in/fredrick-mureti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
                <a
                  href="https://github.com/fredrickmureti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Interested in integrating PayHub Prime into your project? <br />
                Let me know how I can help make payment integration easier for you.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

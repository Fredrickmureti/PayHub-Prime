# PayHub Prime 🚀

### Developer-First Payment Integration API for African Markets

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E)](https://supabase.com)

---

## 🎯 What is PayHub Prime?

**PayHub Prime** is a **100% free, developer-first payment integration API** that simplifies connecting to multiple African and global payment providers through a single, unified REST API.

Stop juggling multiple SDKs, documentation, and credential management systems. PayHub Prime gives you:

- ✅ **One API** for M-Pesa, Airtel Money, PayPal, and Stripe
- ✅ **Secure credential vault** with AES-256 encryption
- ✅ **Unified webhook system** - one endpoint for all payment events
- ✅ **Real-time transaction tracking** and debugging tools
- ✅ **Sandbox testing** for all payment methods
- ✅ **No subscription fees, no transaction fees, no credit card required**

---

## 🌍 Why PayHub Prime?

### The Problem
Integrating payment systems in Africa is complex:
- Each payment provider (M-Pesa, Airtel Money, PayPal, Stripe) has different APIs, SDKs, and documentation
- Managing credentials securely across multiple providers is challenging
- Webhook formats vary between providers, requiring custom parsing logic
- Testing requires separate sandbox environments for each provider
- Developers waste weeks implementing and maintaining integrations

### The Solution
PayHub Prime provides a **single, unified API layer** that handles all the complexity:

```javascript
// One API call works for M-Pesa, Airtel Money, PayPal, AND Stripe
const response = await fetch('https://api.payhubprime.com/v1/sessions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    currency: 'KES',
    payment_method: 'mpesa', // or 'airtel', 'paypal', 'stripe'
    phone: '+254712345678'
  })
});
```

**That's it.** No need to learn four different APIs. No credential management headaches. No webhook parsing nightmares.

---

## 🚀 Key Features

### 1. **Unified Payment API**
Integrate M-Pesa, Airtel Money, PayPal, and Stripe with a single REST API. No need to manage multiple SDKs or learn different documentation for each provider.

### 2. **Secure Credential Vault**
Store all your payment provider credentials encrypted with AES-256. Never expose API keys in your frontend code. Rotate credentials anytime from your dashboard.

### 3. **Unified Webhooks**
Receive standardized webhook events from all payment methods. One webhook URL, one payload format - no more parsing different provider responses.

### 4. **Developer Dashboard**
- Manage API keys
- View integration logs
- Configure payment providers
- Monitor webhook deliveries
- Debug failed transactions in real-time

### 5. **Sandbox Testing**
Test all payment methods in sandbox mode without processing real payments. Perfect for development, staging, and QA environments.

### 6. **Transaction Tracking**
Monitor payment integration status, view detailed logs, track webhook deliveries, and debug issues from a centralized dashboard.

### 7. **Comprehensive Documentation**
- REST API reference with Postman collections
- Code examples in Node.js, Python, PHP, and more
- Step-by-step integration guides
- Troubleshooting resources

### 8. **100% Free Forever**
- No subscription fees
- No transaction processing fees from us
- No credit card required
- No hidden costs

---

## 🏗️ Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for lightning-fast development
- Tailwind CSS for beautiful, responsive design
- shadcn/ui component library
- React Router for navigation
- React Query for data fetching

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Edge Functions (Serverless)
- Row Level Security (RLS) for data protection
- RESTful API architecture

**Payment Integrations:**
- M-Pesa Daraja API
- Airtel Money API
- PayPal REST API
- Stripe API

**Security:**
- AES-256 encryption for credentials
- HTTPS/TLS 1.3 for all API calls
- API key authentication
- Webhook signature verification

---

## 📦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/payhub-prime.git
cd payhub-prime
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### 5. Build for Production

```bash
npm run build
```

---

## 📚 How It Works

### Step 1: Sign Up & Get API Keys
Create a free account and generate your API keys instantly. No credit card required.

### Step 2: Configure Payment Providers
Add your merchant credentials for M-Pesa, Airtel Money, PayPal, or Stripe. Your credentials are encrypted with AES-256 and never exposed.

### Step 3: Integrate the API
Use our REST API or SDKs to connect your application. Complete integration in 15 minutes with our comprehensive documentation.

### Step 4: Go Live
Your users can now pay via M-Pesa, Airtel Money, PayPal, or Stripe through their own accounts. Monitor everything from your dashboard.

---

## 🔌 API Example

### Create a Payment Session

```javascript
POST https://api.payhubprime.com/v1/sessions

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "amount": 1000,
  "currency": "KES",
  "payment_method": "mpesa",
  "phone": "+254712345678",
  "callback_url": "https://yourdomain.com/payment-callback"
}

Response:
{
  "session_id": "sess_abc123xyz",
  "status": "pending",
  "payment_url": "https://payhubprime.com/pay/sess_abc123xyz",
  "expires_at": "2025-10-12T15:30:00Z"
}
```

### Receive Webhook Notification

```javascript
POST https://yourdomain.com/payment-callback

Body:
{
  "event": "payment.success",
  "session_id": "sess_abc123xyz",
  "amount": 1000,
  "currency": "KES",
  "payment_method": "mpesa",
  "transaction_id": "MPE12345XYZ",
  "timestamp": "2025-10-12T15:25:30Z"
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚠️ Important Notes

### What PayHub Prime IS:
✅ A payment integration API platform  
✅ A credential management and encryption system  
✅ A webhook aggregation service  
✅ Developer tools for simplified payment integration  

### What PayHub Prime IS NOT:
❌ A payment gateway (like Stripe/PayPal)  
❌ A payment processor that holds funds  
❌ A collection account service  
❌ A substitute for merchant accounts  

**You need your own merchant accounts** with M-Pesa, Airtel Money, PayPal, or Stripe. PayHub Prime provides the API infrastructure to integrate with them easily. Payments are processed through your merchant accounts, and funds are settled directly to your bank account by the payment providers.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

**Developer:** Fredrick Mureti

**Email:** fredrickmureti612@gmail.com  
**Phone/WhatsApp:** +254 797 504 827

**Connect:**
- [LinkedIn](https://linkedin.com/in/fredrick-mureti)
- [GitHub](https://github.com/fredrickmureti)

---

## 🌟 Show Your Support

If you find PayHub Prime useful, please:
- ⭐ Star this repository
- 🐛 Report bugs or request features via [Issues](https://github.com/yourusername/payhub-prime/issues)
- 📢 Share with other developers who need payment integration solutions
- 🤝 Contribute to the codebase

---

## 🚀 Roadmap

- [ ] Add support for more African payment providers (MTN Mobile Money, Vodacom M-Pesa, etc.)
- [ ] Mobile SDKs (React Native, Flutter)
- [ ] GraphQL API endpoint
- [ ] Advanced analytics and reporting
- [ ] Multi-currency conversion support
- [ ] Recurring payments and subscriptions
- [ ] Payment links and invoicing

---

## 🙏 Acknowledgments

Built with:
- [Lovable](https://lovable.dev) - AI-powered development platform
- [Supabase](https://supabase.com) - Open-source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

**Made with ❤️ for developers integrating payments in Africa**

---

## 📊 Project Stats

- **Lines of Code:** ~15,000+
- **Components:** 50+
- **API Endpoints:** 20+
- **Supported Payment Methods:** 4 (M-Pesa, Airtel Money, PayPal, Stripe)
- **Integration Time:** ~15 minutes
- **Cost:** $0 (100% Free)

---

*PayHub Prime - Simplifying payment integration, one API at a time.* 🚀

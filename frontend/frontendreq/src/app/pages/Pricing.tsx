import { Check, Star, Shield } from 'lucide-react';

export function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '0',
      period: 'Free Forever',
      description: 'Perfect for occasional babysitting needs',
      features: [
        'Browse caregiver profiles',
        'Read reviews and ratings',
        'Send up to 5 messages per month',
        'Basic search filters',
        'Safety tips and resources',
      ],
      notIncluded: [
        'Background check access',
        'Priority booking',
        'Multiple booking discount',
      ],
      popular: false,
      cta: 'Get Started',
    },
    {
      name: 'Premium',
      price: '29',
      period: 'per month',
      description: 'Best for families with regular childcare needs',
      features: [
        'Everything in Basic',
        'Unlimited messaging',
        'Access to background checks',
        'Priority booking',
        'Advanced search & filters',
        '10% discount on bookings',
        '24/7 customer support',
        'Booking history & favorites',
      ],
      notIncluded: [],
      popular: true,
      cta: 'Start Free Trial',
    },
    {
      name: 'Family Plus',
      price: '49',
      period: 'per month',
      description: 'Ideal for families needing frequent care',
      features: [
        'Everything in Premium',
        '20% discount on all bookings',
        'Dedicated family coordinator',
        'Multi-child discounts',
        'Last-minute booking priority',
        'Backup caregiver guarantee',
        'Monthly activity reports',
        'Exclusive caregiver access',
      ],
      notIncluded: [],
      popular: false,
      cta: 'Contact Sales',
    },
  ];

  const faqs = [
    {
      question: 'How does pricing work for booking caregivers?',
      answer:
        'Caregivers set their own hourly rates, typically ranging from $15-30 per hour. Your membership tier provides discounts on these bookings. Payment is processed securely through our platform.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        'Yes! You can cancel your subscription at any time. There are no long-term contracts or cancellation fees.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal.',
    },
    {
      question: 'Is there a free trial available?',
      answer:
        'Yes! Premium and Family Plus plans come with a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        'We offer a 30-day money-back guarantee on all paid plans. If you are not satisfied, contact us for a full refund.',
    },
  ];

  const additionalCosts = [
    {
      service: 'Background Check',
      cost: 'Included in Premium+',
      basic: '$25 one-time',
    },
    {
      service: 'Booking Fee',
      cost: 'Waived',
      basic: '$5 per booking',
    },
    {
      service: 'Cancellation Fee',
      cost: 'None (24hr notice)',
      basic: '$10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your family's needs. All plans include access to verified, background-checked caregivers.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-4 ring-purple-600 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 ml-2">/{plan.period === 'Free Forever' ? 'free' : 'mo'}</span>
                    </div>
                    {plan.period !== 'Free Forever' && (
                      <p className="text-sm text-gray-500 mt-1">Billed monthly</p>
                    )}
                  </div>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3 opacity-40">
                        <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Costs */}
      <div className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600">
              Transparent pricing for everything you need
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Service</th>
                  <th className="px-6 py-4 text-left">Premium/Family Plus</th>
                  <th className="px-6 py-4 text-left">Basic Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {additionalCosts.map((item, index) => (
                  <tr key={index} className="bg-white">
                    <td className="px-6 py-4 font-semibold">{item.service}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{item.cost}</td>
                    <td className="px-6 py-4 text-gray-600">{item.basic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-white text-center">
            <div>
              <Shield className="mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2">100% Secure</h3>
              <p className="opacity-90">All payments are encrypted and secure</p>
            </div>
            <div>
              <Star className="mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2">Top Rated</h3>
              <p className="opacity-90">Trusted by 50,000+ families</p>
            </div>
            <div>
              <Check className="mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2">Money-Back Guarantee</h3>
              <p className="opacity-90">30-day refund policy, no questions asked</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our team is here to help you choose the right plan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all font-semibold">
              Contact Support
            </button>
            <button className="bg-white text-gray-800 px-8 py-4 rounded-lg border-2 border-gray-200 hover:border-purple-600 transition-all font-semibold">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

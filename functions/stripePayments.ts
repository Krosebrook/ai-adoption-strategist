import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get("STRIPE_API_KEY");
    
    if (!apiKey) {
      return Response.json({ 
        error: 'Stripe not configured',
        note: 'Add STRIPE_API_KEY to secrets' 
      }, { status: 400 });
    }

    const stripe = new Stripe(apiKey);
    const { action, customerId, amount, currency, priceId, metadata } = await req.json();

    let result;

    if (action === 'create_customer') {
      result = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata
      });
    } else if (action === 'create_checkout_session') {
      result = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/success`,
        cancel_url: `${req.headers.get('origin')}/cancel`
      });
    } else if (action === 'get_subscriptions') {
      result = await stripe.subscriptions.list({ customer: customerId });
    } else if (action === 'create_payment_intent') {
      result = await stripe.paymentIntents.create({
        amount,
        currency: currency || 'usd',
        customer: customerId,
        metadata
      });
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
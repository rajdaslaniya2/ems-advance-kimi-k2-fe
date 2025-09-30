import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

interface StripePaymentProps {
  eventId: string;
  tickets: number;
  totalPrice: number;
  userName: string;
  userEmail: string;
  selectedSeats: string[];
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentCancel: () => void;
}

const StripeCheckoutForm: React.FC<{
  eventId: string;
  tickets: number;
  totalPrice: number;
  userName: string;
  userEmail: string;
  selectedSeats: string[];
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentCancel: () => void;
}> = ({
  eventId,
  tickets,
  totalPrice,
  userName,
  userEmail,
  selectedSeats,
  onPaymentSuccess,
  onPaymentCancel
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState<string>('');
    const [bookingId, setBookingId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
      const createPaymentIntent = async () => {
        try {
          const response = await api.createPaymentIntent({
            eventId,
            tickets,
            userName,
            userEmail,
            amount: totalPrice,
            selectedSeats,
          });
          setClientSecret(response.clientSecret);
          setBookingId(response.bookingId);
        } catch (err) {
          setError('Failed to create payment intent');
        }
      };

      createPaymentIntent();
    }, [eventId, tickets, totalPrice, userName, userEmail, selectedSeats]);

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      setLoading(true);
      setError('');

      if (!stripe || !elements) {
        setError('Stripe not loaded');
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card details not provided');
        setLoading(false);
        return;
      }

      try {
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: userName,
              email: userEmail,
            },
          },
        });

        if (stripeError) {
          setError(stripeError.message || 'Payment failed');
          setLoading(false);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          await api.confirmPayment({
            paymentIntentId: paymentIntent.id,
            bookingId: bookingId
          });
          onPaymentSuccess(bookingId);
        }
      } catch (err) {
        setError('Payment processing failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-md p-2">
              <CardElement
                options={{
                  hidePostalCode: true,  // ✅ disables the zip code field
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onPaymentCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading || !clientSecret}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₹${totalPrice}`}
            </button>
          </div>
        </div>
      </form>
    );
  };

const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripePayment;

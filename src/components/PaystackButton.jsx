import { Pixel } from '../lib/marketing';
import { supabase } from '../lib/supabaseClient';

/**
 * Paystack Button Component
 * Handles the payment flow for the $47 Gold Edition offer.
 */
export default function PaystackButton({ user, onSuccess }) {
  const handlePayment = () => {
    Pixel.trackInitiateCheckout('Gold Edition');
    if (!window.PaystackPop) {
      alert('Payment system is still loading. Please try again in a moment.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_f84800b3cfc6b0a2fd8fb5e24bfc09c9aee3246d',
      email: user.email,
      amount: 4700, // $47.00
      currency: 'USD',
      ref: `RP-${Math.floor(Math.random() * 1000000000 + 1)}`,
      callback: async (response) => {
        Pixel.trackPurchase(47, 'USD');
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_gold: true, 
            payment_ref: response.reference 
          })
          .eq('id', user.id);

        if (!error) {
          onSuccess(response.reference);
        } else {
          console.error('[Payment] Error updating profile:', error);
          alert('Payment was successful but we had an issue updating your account. Please contact support.');
        }
      },
      onClose: () => {
        console.log('[Payment] Window closed by user.');
      }
    });

    handler.open();
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        width: '100%',
        padding: '16px',
        background: 'var(--gold)',
        color: '#000',
        border: 'none',
        borderRadius: 'var(--radius)',
        fontSize: '15px',
        fontWeight: 700,
        fontFamily: 'var(--font-data)',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(212,175,55,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'transform 0.2s'
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <span>💰</span> UPGRADE TO GOLD EDITION ($47)
    </button>
  );
}

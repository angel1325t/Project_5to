import stripe
from django.conf import settings

# Configurar Stripe con tu clave secreta
stripe.api_key = "sk_test_xxx"  # Reemplázala con tu clave de prueba

def crear_pago(monto, moneda="usd"):
    try:
        pago = stripe.PaymentIntent.create(
            amount=monto,  # Monto en centavos (ej. 1000 = 10 USD)
            currency=moneda,
            payment_method_types=["card"],
        )
        return pago
    except stripe.error.StripeError as e:
        return {"error": str(e)}

# Prueba rápida
if __name__ == "__main__":
    print(crear_pago(1000))  # 10 USD

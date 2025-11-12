from decimal import Decimal
from django.db import transaction
from accounts.models import Wallet, Transaction
from django.contrib.auth import get_user_model

User = get_user_model()

@transaction.atomic 
def credit_chef_wallet(chef_user, amount, order_id):
    """
    Credits the chef's wallet with 95% of the bid amount and 
    credits 5% comission to the platform admin's wallet.
    """
    comission_rate = Decimal('0.05')
    comission_amount = amount * comission_rate
    chef_earnings = amount - comission_amount

    # Chef wallet 
    chef_wallet = Wallet.objects.get(user=chef_user)
    chef_wallet.balance += chef_earnings
    chef_wallet.save()

    Transaction.objects.create(
        wallet=chef_wallet,
        transaction_type='credit', 
        amount=chef_earnings,
        description=f"Earnings from Order #{order_id}"
    )

    # Admin wallet (Platform comission)
    admin_user = User.objects.filter(is_superuser=True).first()
    if admin_user:
        admin_wallet = Wallet.objects.get(user=admin_user)
        admin_wallet.balance += comission_amount
        admin_wallet.save()

        Transaction.objects.create(
            wallet=admin_wallet,
            transaction_type='commission',
            amount=comission_amount,
            description=f"Comission from Order #{order_id}"
        )

    return {
        "chef_earnings": chef_earnings,
        "commission": comission_amount
    }
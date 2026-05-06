let selectedAddress = "";
let selectedPayment = "";

// Address & Payment Selection

function selectAddress(id) {
    document.querySelectorAll(".address-card")
        .forEach(card => card.classList.remove("border-info"));
    document.getElementById(`addr-${id}`).classList.add("border-info");
    selectedAddress = id;
}

function selectPayment(method) {
    document.querySelectorAll(".payment-option")
        .forEach(opt => opt.classList.remove("active"));
    document.getElementById(`pay-${method}`).classList.add("active");
    selectedPayment = method;
}

// Place order for COD / Wallet

async function placeDirectOrder(paymentMethod) {
    try {
        const response = await fetch("/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addressId: selectedAddress, paymentMethod })
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = `/orders/${data.orderId}`;
        } else {
            Swal.fire("Error!", data.message, "error");
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
}

// Place Order

document.getElementById("placeOrderBtn").addEventListener("click", async () => {
    if (!selectedAddress) {
        Swal.fire("Oops!", "Please select a delivery address.", "warning");
        return;
    }
    if (!selectedPayment) {
        Swal.fire("Oops!", "Please select a payment method.", "warning");
        return;
    }

    const total = parseInt(
        document.getElementById("checkoutTotal")
            .textContent.replace("₹", "").replace(/,/g, "").trim()
    );

    // Frontend COD limit check
    if (selectedPayment === "COD" && total > 5000) {
        Swal.fire("Not Available", "COD is only available for orders up to ₹5,000.", "warning");
        return;
    }

    if (selectedPayment === "COD" || selectedPayment === "wallet") {
        await placeDirectOrder(selectedPayment);
        return;
    }

    // Online Payment - Razorpay

    try {
        const orderRes = await fetch("/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: total * 100 })
        });
        const orderData = await orderRes.json();
        if (!orderData.success) {
            Swal.fire("Error!", "Payment initiation failed. Try again.", "error");
            return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: orderData.order.amount,
            currency: "INR",
            order_id: orderData.order.id,
            name: "GadgetHub",
            description: "Order Payment",

            handler: async function (response) {
                try {
                    const verifyRes = await fetch("/checkout/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id:  response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature:  response.razorpay_signature,
                            addressId: selectedAddress,
                            paymentMethod: "online"
                        })
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        window.location.href = `/orders/${verifyData.orderId}`;
                    } else {
                        Swal.fire("Error!", verifyData.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error!", "Payment verification failed. Contact support.", "error");
                }
            },

            prefill: {
                name:    USER_NAME,
                email:   USER_EMAIL,
                contact: USER_PHONE || "9999999999"
            },

            theme: { color: "#06b6d4" }
        };

        const rzp = new Razorpay(options);

        rzp.on("payment.failed", function (response) {
            Swal.fire("Payment Failed", response.error.description || "Try again.", "error");
        });

        rzp.open();

    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});
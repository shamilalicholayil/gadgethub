let selectedAddress = "";
let selectedPayment = "";

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

document.getElementById("placeOrderBtn")
    .addEventListener("click", async () => {
        if(!selectedAddress) return alert("Please select a delivery address.");
        if(!selectedPayment) return alert("Please select a payment method.");

        if(selectedPayment === "COD") {
            // Your existing COD logic
            const response = await fetch("/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addressId: selectedAddress, paymentMethod: selectedPayment })
            });
            const data = await response.json();
            if(data.success) {
                window.location.href = `/orders/${data.orderId}`;
            } else {
                alert(data.message);
            }

        } else {
            // Online payment — Razorpay flow
            const total = parseInt(document.getElementById("checkoutTotal")
                .textContent.replace("₹", "").replace(/,/g, "").trim());

            const amountInPaise = total * 100;

            // Step 1: Create Razorpay order on server
            const orderRes = await fetch("/checkout/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountInPaise })
            });
            const orderData = await orderRes.json();
            if(!orderData.success) return alert("Payment initiation failed.");

            // Step 2: Open Razorpay popup
            const options = {
                key: RAZORPAY_KEY,
                amount: orderData.order.amount,
                currency: "INR",
                order_id: orderData.order.id,

                name: "GadgetHub",
                description: "Order Payment",

                handler: async function(response) {
                    const verifyRes = await fetch("/checkout/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            addressId: selectedAddress,
                            paymentMethod: "online"
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        window.location.href = `/orders/${verifyData.orderId}`;
                    } else {
                        alert(verifyData.message);
                    }
                },

                prefill: {
                    name: USER_NAME,
                    email: USER_EMAIL,
                    contact: "9999999999"
                },

                theme: { color: "#06b6d4" }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        }
    });
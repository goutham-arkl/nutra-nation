
function addToCart(proId){
  $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        if(response.status)
          alert(response)
      }
  })
}
$("#click-me").click(function(){
    $("#div1").toggle();
  }); 

  //////////////////////////////////////////////////////RAZOR-PAY/////////////////////////////////////////////////////////////////////

//   let rzp1 = {}
//     $("#checkout-form").submit((e)=>{
//         e.preventDefault()
//         $.ajax({
//             url:'/place-order',
//             method:'post',
//             data:$('#checkout-form').serialize(),
//             success:(response)=>{
                
              
//                 if(response.codSuccess)
//                 {   
//                     console.log('hellooooooooooooooo');
//                     location.href='/order-placed'
//                 }else{
//                   console.log('helloooo');
//                   console.log(response);
//                  razorpayPayment(response)
//                 }
//             }
//         })
   

//     function razorpayPayment(order){
   
//       var options = {
//     "key": "rzp_test_hoUa0LVqQYvuNv", // Enter the Key ID generated from the Dashboard
//     "amount": order.amount*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
//     "currency": "INR",
//     "name": "Nutra-Nation",
//     "description": "Test Transaction",
//     "image": "https://example.com/your_logo",
//     "order_id":order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
//     "handler": function (response){
//       console.log('elooooooooooooooooooooooooooooooooooooooo');
//         console.log(response);
//         alert(response.razorpay_payment_id);
//         alert(response.razorpay_order_id);
//         alert(response.razorpay_signature)


//         verifyPayment(response,order)
//     },
//     "prefill": {
//         "name": "Goutham A",
//         "email": "gouthamarkl@gmail.com",
//         "contact": "9999999999"
//     },
//     "notes": {
//         "address": "Nutra-Nation Pvt Ltd"
//     },
//     "theme": {
//         "color": "#3399cc"
//     }
// };
// rzp1 = new Razorpay(options);
// rzp1.open();

//  }

// function verifyPayment(payment,order){
//   $.ajax({
//     url:'/verify-payment',
//     data:{
//       payment,
//       order
//     },
//     method:'post',
//     success:(response)=>{
//      if(response.status){
//       location.href='/order-placed'
//      }else{
//         alert("payment Failed")
//      }
//     }
//   })
// }

// })


  ////////////////////////////////////////////////////////////PAYPAL/////////////////////////////////////////////////////////////////////////////// 

  paypal.Buttons({
    // Order is created on the server and the order id is returned
    createOrder: (data, actions) => {
      return fetch("/api/orders", {
        method: "post",
        // use the "body" param to optionally pass additional order information
        // like product ids or amount
      })
      .then((response) => response.json())
      .then((order) => order.id);
    },
    // Finalize the transaction on the server after payer approval
    onApprove: (data, actions) => {
      return fetch(`/api/orders/${data.orderID}/capture`, {
        method: "post",
      })
      .then((response) => response.json())
      .then((orderData) => {
        // Successful capture! For dev/demo purposes:
        console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
        const transaction = orderData.purchase_units[0].payments.captures[0];
        alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);
        // When ready to go live, remove the alert and show a success message within this page. For example:
        // const element = document.getElementById('paypal-button-container');
        // element.innerHTML = '<h3>Thank you for your payment!</h3>';
        // Or go to another URL:  actions.redirect('thank_you.html');
      });
    }
  }).render('#paypal');
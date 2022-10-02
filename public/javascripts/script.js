
function addToCart(proId){

  $.ajax({
    
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        console.log(response);
        if(response.status)
          alert(response)
      }
  })
}

function addToWishlist(proId){
  console.log(proId);
  $.ajax({
    
      url:'/add-to-wishlist/'+proId,
      method:'get',
      success:(response)=>{
        console.log(response);
        if(response.status)
          alert(response)
      }
  })
}

$("#click-me").click(function(){
    $("#div1").toggle();
  }); 
  //////////////////coupon////////////////////////////

  function addCoupon() {
        let couponName = document.querySelector("input[name='name']").value
       
        let total = document.querySelector("input[name='total']").value
        console.log(total);
       
        $.ajax({
            url: '/apply-coupon',
            data: {
                name: couponName,
                total: total
            },
            method: 'post',
            success: (response) => { 

                if (response.total) {
                  console.log(response.total);
                  let value=response.total
                  $('#totalA').html(value)
                  

                    // errorCoupon.innerHTML = ""
                    // document.getElementById('totalA').innerText = response.total
                } else if (response.noCoupon) {
                    errorCoupon.innerHTML = "No Coupon"
                    let value=response.noCoupon
                  $('#err').html(value)
                    // document.getElementById('totalAmount').innerText = response.Total
                }
                else {
                    
                    errorCoupon.innerHTML = "Coupon Not Available"
                }

            }
        })

    }
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



  

     
 
      paypal_sdk
  .Buttons({
    createOrder: function () {
      return fetch("/paypal/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: 1,
              quantity: 2,
            },
            { id: 2, quantity: 3 },
          ],
        }),
      })
        .then(res => {
          console.log(res,'=============================')
          // if (res.ok) return res.json()
          // return res.json().then(json => Promise.reject(json))
        })
//         .then(({ id }) => {
//           return id
//         })
//         .catch(e => {
//           console.error(e.error)
//         })
//     },
//     onApprove: function (data, actions) {
//       let hi =actions.order.capture()
//       fetch("/product/placeOrder/paypal").then(val=>val.json())
//       .then(val=>{
//         if (val == 'success') {
//          alert(val)
//         }
//         document.getElementById("paypal").innerHTML =`
//    <div class="container">
//    <div class="row">
//       <div class="col-md-6 mx-auto mt-5">
//          <div class="payment">
//             <div class="payment_header">
//                <div class="check"><i class="fa fa-check" aria-hidden="true"></i></div>
//             </div>
//             <div class="content">
//                <h1>Payment Success !</h1>
//              <!--  <p>Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. </p> -->
//                <a href="/">Go to Home</a>
//                <br />
//                <a href="/profile/viwOrders">View Orders</a>
//             </div>
            
//          </div>
//       </div>
//    </div>
// </div>
//         `
//       return  hi
//       })
      
    },
  })
  .render("#paypal")
   


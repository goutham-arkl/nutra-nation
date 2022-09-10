
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

  
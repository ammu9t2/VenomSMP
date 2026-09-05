const IP="venom.mc-game.xyz";
const PRODUCTS={
 vip:{name:"VIP Rank",price:9.99},mvp:{name:"MVP Rank",price:14.99},legend:{name:"LEGEND Rank",price:24.99},
 coins:{name:"50,000 Venom Coins",price:7.99},crate:{name:"Toxic Crate Keys ×10",price:5.99},bundle:{name:"Starter Bundle",price:19.99}
};
let cart=JSON.parse(localStorage.getItem("venomCart")||"{}");
let discount=0;
const $=s=>document.querySelector(s);
function money(n){return "$"+n.toFixed(2)}
function save(){localStorage.setItem("venomCart",JSON.stringify(cart))}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function render(){
 const ids=Object.keys(cart).filter(id=>cart[id]>0);
 $("#count").textContent=ids.reduce((a,id)=>a+cart[id],0);
 $("#cartItems").innerHTML=ids.length?ids.map(id=>`
 <div class="cartLine"><div><b>${PRODUCTS[id].name}</b><small>${money(PRODUCTS[id].price)} each</small></div>
 <div class="qty"><button data-act="minus" data-id="${id}">−</button><span>${cart[id]}</span><button data-act="plus" data-id="${id}">+</button><button data-act="remove" data-id="${id}">×</button></div></div>`).join("")
 : `<div style="padding:35px 0;color:#718879;font-size:12px">Your cart is empty.<br><br>Add a rank, bundle or item to get started.</div>`;
 const sub=ids.reduce((a,id)=>a+PRODUCTS[id].price*cart[id],0);
 const d=sub*discount, total=Math.max(0,sub-d);
 $("#sub").textContent=money(sub);$("#disc").textContent=money(d);$("#grand").textContent=money(total);$("#modalTotal").textContent=money(total);
 save();
}
function openCart(){ $("#drawer").classList.add("open");$("#shade").classList.add("open") }
function closeCart(){ $("#drawer").classList.remove("open");$("#shade").classList.remove("open") }
document.addEventListener("click",e=>{
 const add=e.target.closest(".add");
 if(add){const id=add.dataset.id;cart[id]=(cart[id]||0)+1;render();toast(PRODUCTS[id].name+" added to cart");openCart()}
 const q=e.target.closest("[data-act]");
 if(q){const id=q.dataset.id,a=q.dataset.act;if(a==="plus")cart[id]++;if(a==="minus")cart[id]--;if(a==="remove")delete cart[id];render()}
});
$("#cartOpen").onclick=openCart;$("#closeCart").onclick=closeCart;$("#shade").onclick=closeCart;
$("#copyIp").onclick=async()=>{try{await navigator.clipboard.writeText(IP);toast("Server IP copied: "+IP)}catch{toast(IP)}};
$("#apply").onclick=()=>{const code=$("#promo").value.trim().toUpperCase();if(code==="VENOM10"){discount=.10;toast("VENOM10 applied — 10% off")}else{discount=0;toast("Invalid promo code")}render()};
$("#checkout").onclick=()=>{if(!Object.keys(cart).length)return toast("Your cart is empty");$("#modal").classList.add("open");closeCart()};
$("#closeModal").onclick=()=>$("#modal").classList.remove("open");
$("#pay").onclick=async()=>{
 const username=$("#username").value.trim(),email=$("#email").value.trim();
 if(!username)return toast("Enter your Minecraft username");
 const items=Object.entries(cart).map(([id,quantity])=>({id,quantity}));
 const btn=$("#pay");btn.disabled=true;btn.textContent="CREATING CHECKOUT…";
 try{
  const r=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items,username,email})});
  const data=await r.json(); if(!r.ok)throw new Error(data.error||"Checkout error");
  if(data.mode==="stripe"){location.href=data.url}
  else{localStorage.removeItem("venomCart");location.href="/?checkout=success"}
 }catch(err){toast(err.message)}
 finally{btn.disabled=false;btn.textContent="CONTINUE TO PAYMENT →"}
};
(async()=>{
 const p=new URLSearchParams(location.search),status=p.get("checkout"),sid=p.get("session_id");
 if(status==="success"&&sid){
   localStorage.removeItem("venomCart");render();
   try{await fetch("/api/checkout-session?session_id="+encodeURIComponent(sid))}catch{}
   toast("Payment confirmed — thanks for supporting Venom SMP!");
 }else if(status==="success"){localStorage.removeItem("venomCart");render();toast("Demo order confirmed!")}
})();
render();
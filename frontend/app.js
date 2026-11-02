const $ = selector => document.querySelector(selector);
const grid = $("#grid"), search = $("#search"), category = $("#category"), sort = $("#sort");
let products = [];
const money = value => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);

async function load() {
  try {
    const [pRes, cRes] = await Promise.all([fetch("/api/products?limit=100"), fetch("/api/categories")]);
    if (!pRes.ok || !cRes.ok) throw new Error("API request failed");
    products = (await pRes.json()).items;
    (await cRes.json()).forEach(c => { const o=document.createElement("option"); o.value=c; o.textContent=c; category.append(o); });
    render();
  } catch (e) {
    $("#error").hidden = false;
    $("#error").textContent = "Could not load products. Start the Flask server and initialize the database.";
    $("#count").textContent = "Catalogue unavailable";
  }
}
function visibleProducts() {
  const q=search.value.trim().toLowerCase();
  let list=products.filter(p => (!q || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)) && (!category.value || p.category===category.value));
  if(sort.value==="asc") list.sort((a,b)=>a.price-b.price);
  if(sort.value==="desc") list.sort((a,b)=>b.price-a.price);
  if(sort.value==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}
function render() {
  const list=visibleProducts(); grid.replaceChildren();
  $("#count").textContent=`${list.length} ${list.length===1?"product":"products"} to discover`;
  $("#empty").hidden=list.length>0;
  list.forEach((p,i)=>{
    const card=document.createElement("article"); card.className="card"; card.tabIndex=0;
    card.innerHTML=`<div class="image-wrap"><img src="${p.image_url}" alt=""><span class="tag">${i<2?"Forma favourite":p.category}</span><button class="quick">View details ↗</button></div><div class="info"><p class="category"></p><div class="name-row"><h3 class="name"></h3><p class="price"></p></div><p class="desc"></p></div>`;
    card.querySelector("img").alt=p.name;
    card.querySelector(".category").textContent=p.category;
    card.querySelector(".name").textContent=p.name;
    card.querySelector(".price").textContent=money(p.price);
    card.querySelector(".desc").textContent=p.description;
    card.querySelector("img").addEventListener("error",e=>{e.currentTarget.src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80"},{once:true});
    card.addEventListener("click",()=>details(p.id));
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();details(p.id)}});
    grid.append(card);
  });
}
async function details(id) {
  try {
    const res=await fetch(`/api/products/${id}`);
    if(!res.ok) throw new Error("Product details could not be loaded.");
    const p=await res.json();
    $("#detail-img").src=p.image_url; $("#detail-img").alt=p.name;
    $("#detail-cat").textContent=p.category.toUpperCase(); $("#detail-name").textContent=p.name;
    $("#detail-price").textContent=money(p.price); $("#detail-desc").textContent=p.description;
    $("#detail-stock").textContent=`${p.stock} available`;
    $("#modal").hidden=false; document.body.style.overflow="hidden"; $("#close").focus();
  } catch(e) { $("#error").hidden=false; $("#error").textContent=e.message; }
}
function closeModal(){ $("#modal").hidden=true; document.body.style.overflow=""; }
search.addEventListener("input",render); category.addEventListener("change",render); sort.addEventListener("change",render);
$("#clear").addEventListener("click",()=>{search.value="";category.value="";sort.value="featured";render()});
$("#close").addEventListener("click",closeModal); $("#back").addEventListener("click",closeModal);
$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden)closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();search.focus()}});
document.querySelectorAll('[data-jump]').forEach(link=>link.addEventListener('click',()=>{category.value=link.dataset.jump;render()}));
load();

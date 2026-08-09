const documents = [
  {tag:"NỘI VỤ", title:"Cải cách hành chính", desc:"Khu vực lưu văn bản, kế hoạch và tài liệu CCHC.", file:"#"},
  {tag:"NGƯỜI CÓ CÔNG", title:"Hồ sơ người có công", desc:"Biểu mẫu và hướng dẫn nghiệp vụ cần tra cứu.", file:"#"},
  {tag:"AN SINH XÃ HỘI", title:"Bảo trợ xã hội", desc:"Tài liệu phục vụ công tác trợ giúp xã hội.", file:"#"},
  {tag:"CHUYỂN ĐỔI SỐ", title:"Công cụ số", desc:"Tài liệu, hướng dẫn và tiện ích công nghệ.", file:"#"},
  {tag:"BIỂU MẪU", title:"Giấy đề nghị thanh toán", desc:"Thay liên kết này bằng file Word/PDF thực tế.", file:"#"},
  {tag:"BIỂU MẪU", title:"Phiếu đề xuất", desc:"Thay liên kết này bằng file Word/PDF thực tế.", file:"#"}
];

const grid = document.getElementById("documentGrid");
const search = document.getElementById("searchInput");

function renderDocuments(keyword=""){
  const q = keyword.trim().toLowerCase();
  const filtered = documents.filter(d => `${d.tag} ${d.title} ${d.desc}`.toLowerCase().includes(q));
  grid.innerHTML = filtered.length ? filtered.map(d => `
    <article class="document-card">
      <span class="tag">${d.tag}</span>
      <h3>${d.title}</h3>
      <p>${d.desc}</p>
      <a class="doc-link" href="${d.file}" onclick="if(this.getAttribute('href')==='#'){event.preventDefault();showNotice('Hãy thay dấu # bằng đường dẫn file thật của bạn.')}">Mở tài liệu →</a>
    </article>`).join("") :
    `<div class="document-card"><h3>Không tìm thấy</h3><p>Hãy thử từ khóa khác.</p></div>`;
}
renderDocuments();
search.addEventListener("input", e => renderDocuments(e.target.value));

function calculate(){
  const input = document.getElementById("calcInput").value.trim();
  const result = document.getElementById("calcResult");
  if(!input){result.textContent="Kết quả: —";return;}
  if(!/^[0-9+\-*/().,\s]+$/.test(input)){result.textContent="Kết quả: Chỉ nhập số và phép tính.";return;}
  try{
    const normalized = input.replaceAll(",","").replace(/\s+/g,"");
    const value = Function(`"use strict"; return (${normalized})`)();
    if(!Number.isFinite(value)) throw new Error();
    result.textContent = "Kết quả: " + new Intl.NumberFormat("vi-VN").format(value);
  }catch{result.textContent="Kết quả: Biểu thức không hợp lệ.";}
}

function showNotice(text){
  const box=document.getElementById("notice");
  box.textContent=text;box.classList.add("show");
  clearTimeout(window.noticeTimer);
  window.noticeTimer=setTimeout(()=>box.classList.remove("show"),3500);
}

function saveNotes(){
  localStorage.setItem("personalNotes",document.getElementById("notes").value);
  document.getElementById("saveStatus").textContent="Đã lưu trên máy này.";
}
document.getElementById("notes").value=localStorage.getItem("personalNotes")||"";

const now=new Date();
document.getElementById("today").textContent=now.toLocaleDateString("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"});
document.getElementById("year").textContent=now.getFullYear();
document.getElementById("documentCount").textContent=documents.length;

document.querySelector(".menu-toggle").addEventListener("click",()=>{
  document.querySelector(".main-nav").classList.toggle("open");
});
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".main-nav").classList.remove("open")));

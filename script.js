const data=[
['Nội vụ','Cải cách hành chính','Kế hoạch, báo cáo và tài liệu cải cách hành chính.'],
['Nội vụ','Tổ chức bộ máy và cán bộ','Văn bản, hướng dẫn và biểu mẫu công tác nội vụ.'],
['Người có công','Chính sách người có công','Kho tài liệu phục vụ tra cứu nghiệp vụ người có công.'],
['Người có công','Hồ sơ, biểu mẫu người có công','Nơi liên kết các biểu mẫu Word/PDF.'],
['An sinh xã hội','Bảo trợ xã hội','Tài liệu về trợ giúp xã hội và bảo trợ xã hội.'],
['An sinh xã hội','Trợ cấp và danh sách đối tượng','Mẫu biểu và hướng dẫn tại cơ sở.'],
['Chuyển đổi số','Chuyển đổi số','Tài liệu, kế hoạch và hướng dẫn công nghệ.'],
['Chuyển đổi số','Công cụ số','Tiện ích phục vụ công việc.']
];
const docs=document.getElementById('docs'),cat=document.getElementById('cat'),find=document.getElementById('find'),globalSearch=document.getElementById('global');
function render(q=''){q=q.toLowerCase();docs.innerHTML=data.filter(x=>(!cat.value||x[0]===cat.value)&&x.join(' ').toLowerCase().includes(q)).map(x=>`<article class="card"><span class="tag">${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p><a class="link" href="#" onclick="msg('Chưa gắn file. Hãy thêm Word/PDF vào thư mục tai-lieu.');return false">Mở tài liệu →</a></article>`).join('')||'<article class="card"><h3>Không tìm thấy</h3><p>Hãy thử từ khóa khác.</p></article>'}
cat.onchange=()=>render(find.value);find.oninput=()=>render(find.value);render();
function quick(q){globalSearch.value=q;find.value=q;cat.value='';render(q);document.getElementById('van-ban').scrollIntoView()}
function goSearch(){quick(globalSearch.value)}
function msg(t){const n=document.getElementById('notice');n.textContent=t;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),3000)}
function calculate(){const s=document.getElementById('calc').value.replace(/,/g,'').replace(/\s/g,'');const out=document.getElementById('calcout');if(!/^[0-9+\-*/().]+$/.test(s)){out.textContent='Biểu thức không hợp lệ';return}try{out.textContent=new Intl.NumberFormat('vi-VN').format(Function('return('+s+')')())+' đồng'}catch{out.textContent='Biểu thức không hợp lệ'}}
const one=['','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
function r3(n){let h=Math.floor(n/100),t=Math.floor(n/10)%10,u=n%10,s=h?one[h]+' trăm':'';if(t)s+=(s?' ':'')+(t===1?'mười':one[t]+' mươi')+(u===1&&t>1?' mốt':u===5&&t?' lăm':u?' '+one[u]:'');else if(u)s+=(h?' linh ':' ')+one[u];return s.trim()}
function money(){let raw=document.getElementById('money').value.replace(/\D/g,'');let n=Number(raw);if(!raw||!Number.isSafeInteger(n)){document.getElementById('moneyout').textContent='Hãy nhập số tiền hợp lệ';return}if(n===0){document.getElementById('moneyout').textContent='Không đồng';return}let u=['','nghìn','triệu','tỷ'],p=[],i=0;while(n){let x=n%1000;if(x)p.unshift(r3(x)+(u[i]?' '+u[i]:''));n=Math.floor(n/1000);i++}document.getElementById('moneyout').textContent=p.join(' ')+' đồng'}
document.getElementById('today').textContent=new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});document.getElementById('year').textContent=new Date().getFullYear();document.getElementById('menu').onclick=()=>document.getElementById('nav').classList.toggle('open');

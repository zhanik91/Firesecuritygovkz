// ===== Константы норм ППБ/СТ РК =====
const AREA_PER_OT = { 'A': 50, 'Б': 50, 'В': 100, 'Г': 200, 'Д': 300 }; // м² на 1 ОТ
const MIN_OT_PER_FLOOR = 2;
const THRESHOLD_WHEELED = 500; // м²
const HAS_AUTOPUT_FACTOR = 0.5; // -50%

// Рекомендации по типам
function recommendTypes(hasElec, cat, qty) {
  const parts = [];
  if (hasElec) parts.push(`из них 1–2 шт. CO₂ (ОУ‑5) для электро`);
  if (cat === 'A' || cat === 'Б' || cat === 'В') parts.push(`основа — порошковые ОП‑5/ОП‑9 (ABC)`);
  if (cat === 'Г' || cat === 'Д') parts.push(`подойдут ОП‑5 (универсальные)`);
  return parts.length ? `Рекомендуемые типы: ${parts.join('; ')}.` : '';
}

// === Огнетушители ===
window.calcExtinguishers = function () {
  const S = +document.getElementById('ext-area').value || 0;
  const cat = document.getElementById('ext-cat').value;
  const floors = Math.max(1, +document.getElementById('ext-floors').value || 1);
  const hasAUTP = document.getElementById('ext-autoput').checked;
  const hasElec = document.getElementById('ext-elec').checked;

  let qtyBase = 0;

  // Особый случай: категория Д ≤ 100 м² → можно не устанавливать
  if (cat === 'Д' && S <= 100) {
    document.getElementById('ext-result').innerHTML =
      `<p><b>Требуемое количество:</b> 0 шт.</p>
       <p>Допустимо не устанавливать (кат. Д ≤ 100 м²). <a href="#ppa3p9">См. примечание</a>.</p>`;
    return;
  }

  const areaPerOT = AREA_PER_OT[cat] || 100;
  qtyBase = Math.ceil(S / areaPerOT);

  // Минимум 2 на этаж
  const minByFloor = MIN_OT_PER_FLOOR * floors;
  let qty = Math.max(qtyBase, minByFloor);

  // Снижение при наличии АУПТ
  if (hasAUTP) {
    qty = Math.max(Math.ceil(qty * HAS_AUTOPUT_FACTOR), minByFloor); // не ниже минимума
  }

  // Рекомендация по передвижным
  const wheeled = S > THRESHOLD_WHEELED ? `Также рекомендуется передвижной ОП‑25/ОП‑50 (тележка) для больших очагов.` : ``;

  const types = recommendTypes(hasElec, cat, qty);

  const justification = [
    `<a href="#ppa3p8">минимум 2 на этаж</a>`,
    hasAUTP ? `<a href="#ppa3p13">−50% при АУПТ</a>` : null,
    `<a href="#ppa3p14">нормы расстояний</a>`,
    `<a href="#st1487p85">резерв на время ТО</a>`
  ].filter(Boolean).join(' • ');

  document.getElementById('ext-result').innerHTML =
    `<p><b>Требуемое количество:</b> ${qty} шт.</p>
     <p>${types} ${wheeled}</p>
     <p class="muted">Обоснование: ${justification}.</p>`;
};

// === НГПС ===
const MANDATORY_INDUSTRIES = ['нефтегаз', 'химия', 'энергетика'];
const TECH_BASE = {
  'нефтегаз': 2, 'химия': 2, 'энергетика': 1, 'складГСМ': 1, 'прочее': 1, 'административный': 0
};

function staffRange(numAuto) {
  if (numAuto <= 0) return [8, 10]; // пожарный пост
  const min = 12 * numAuto + 4;     // 3 караула ориентир
  const max = 16 * numAuto + 5;     // 4 караула ориентир
  return [min, max];
}

window.calcNGPS = function () {
  const type = document.getElementById('ngps-type').value;
  const area = +document.getElementById('ngps-area').value || 0;
  const cat = document.getElementById('ngps-cat').value;
  const dist = +document.getElementById('ngps-dist').value || 0;

  const isHazardCat = /^(A|Б|В)$/.test(cat);
  const byList = MANDATORY_INDUSTRIES.includes(type);
  const byRule = (isHazardCat && area >= 3500 && dist > 3);

  let need = false, recommendPost = false, numAuto = 0;
  if (byList) { need = true; numAuto = TECH_BASE[type] || 1; }
  else if (byRule) { need = true; numAuto = TECH_BASE[type] || 1; }
  else if (dist > 3) { recommendPost = true; }

  // Уточнение по крупной площади
  if (need && area > 10000 && numAuto < 2) numAuto = 2;

  let html = '';
  if (need) {
    const [minS, maxS] = staffRange(numAuto);
    const typeHint =
      type === 'нефтегаз' ? ' (АЦ + пенная/порошковая)' :
      type === 'химия' ? ' (АЦ + порошковая)' :
      (numAuto > 0 ? ' (АЦ основная)' : '');

    html = `<p><b>НГПС обязательна:</b> пожарная часть с ${numAuto} авто${typeHint}.</p>
            <p><b>Ориентировочный штат:</b> ${minS}–${maxS} чел (круглосуточно).</p>
            <p class="muted">Обоснование: <a href="#pp1017p8">Перечень №1017, п.8</a>; <a href="#z53p5">Закон «О ГЗ», ст.53</a>.</p>`;
  } else if (recommendPost) {
    const [minS, maxS] = staffRange(0);
    html = `<p><b>НГПС не обязательна.</b> Рекомендуется пожарный пост (без техники): ${minS}–${maxS} чел в штате.</p>
            <p class="muted">Основание: удалённость > 3 км — целесообразно усилить первую реакцию.</p>`;
  } else {
    html = `<p><b>НГПС не обязательна.</b> Достаточно мер общей ПБ и прикрытия ГПС.</p>`;
  }

  document.getElementById('ngps-result').innerHTML = html;
};

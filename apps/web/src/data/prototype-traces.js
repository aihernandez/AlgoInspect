(() => {
  "use strict";

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const graphLayouts = {
    connected: {
      nodes: [
        { id: "A", x: 90, y: 96 }, { id: "B", x: 225, y: 46 }, { id: "C", x: 225, y: 150 },
        { id: "D", x: 370, y: 26 }, { id: "E", x: 370, y: 96 }, { id: "F", x: 505, y: 150 }
      ],
      edges: [
        { source: "A", target: "B", weight: 4 }, { source: "A", target: "C", weight: 2 },
        { source: "B", target: "D", weight: 5 }, { source: "B", target: "E", weight: 1 },
        { source: "C", target: "E", weight: 3 }, { source: "C", target: "F", weight: 8 },
        { source: "E", target: "F", weight: 2 }, { source: "D", target: "F", weight: 4 }
      ]
    },
    branching: {
      nodes: [
        { id: "A", x: 82, y: 94 }, { id: "B", x: 220, y: 35 }, { id: "C", x: 220, y: 94 },
        { id: "D", x: 220, y: 158 }, { id: "E", x: 382, y: 55 }, { id: "F", x: 505, y: 120 }
      ],
      edges: [
        { source: "A", target: "B", weight: 2 }, { source: "A", target: "C", weight: 5 },
        { source: "A", target: "D", weight: 1 }, { source: "B", target: "E", weight: 2 },
        { source: "C", target: "E", weight: 1 }, { source: "D", target: "F", weight: 4 },
        { source: "E", target: "F", weight: 2 }
      ]
    },
    dependencies: {
      nodes: [
        { id: "A", x: 72, y: 52 }, { id: "B", x: 72, y: 150 }, { id: "C", x: 220, y: 45 },
        { id: "D", x: 220, y: 145 }, { id: "E", x: 380, y: 62 }, { id: "F", x: 515, y: 116 }
      ],
      edges: [
        { source: "A", target: "C", weight: 1 }, { source: "A", target: "D", weight: 1 },
        { source: "B", target: "D", weight: 1 }, { source: "C", target: "E", weight: 1 },
        { source: "D", target: "E", weight: 1 }, { source: "D", target: "F", weight: 1 },
        { source: "E", target: "F", weight: 1 }
      ]
    },
    cycle: {
      nodes: [
        { id: "A", x: 72, y: 100 }, { id: "B", x: 205, y: 42 }, { id: "C", x: 352, y: 42 },
        { id: "D", x: 492, y: 100 }, { id: "E", x: 205, y: 158 }, { id: "F", x: 352, y: 158 }
      ],
      edges: [
        { source: "A", target: "B", weight: 1 }, { source: "A", target: "E", weight: 1 },
        { source: "B", target: "C", weight: 1 }, { source: "C", target: "D", weight: 1 },
        { source: "D", target: "C", weight: 1 }, { source: "E", target: "F", weight: 1 }
      ]
    },
    kahnEmpty: {
      nodes: [],
      edges: []
    },
    kahnSingle: {
      nodes: [{ id: "A", x: 295, y: 100 }],
      edges: []
    },
    kahnIsolated: {
      nodes: [
        { id: "A", x: 145, y: 100 }, { id: "B", x: 295, y: 55 }, { id: "C", x: 445, y: 100 }
      ],
      edges: []
    },
    kahnChain: {
      nodes: [
        { id: "A", x: 70, y: 100 }, { id: "B", x: 220, y: 100 }, { id: "C", x: 370, y: 100 }, { id: "D", x: 520, y: 100 }
      ],
      edges: [
        { source: "A", target: "B", weight: 1 }, { source: "B", target: "C", weight: 1 }, { source: "C", target: "D", weight: 1 }
      ]
    },
    kahnBranching: {
      nodes: [
        { id: "A", x: 75, y: 100 }, { id: "B", x: 230, y: 45 }, { id: "C", x: 230, y: 155 },
        { id: "D", x: 390, y: 45 }, { id: "E", x: 390, y: 155 }, { id: "F", x: 530, y: 100 }
      ],
      edges: [
        { source: "A", target: "B", weight: 1 }, { source: "A", target: "C", weight: 1 },
        { source: "B", target: "D", weight: 1 }, { source: "C", target: "E", weight: 1 },
        { source: "D", target: "F", weight: 1 }, { source: "E", target: "F", weight: 1 }
      ]
    },
    kahnDisconnected: {
      nodes: [
        { id: "A", x: 110, y: 70 }, { id: "B", x: 240, y: 70 }, { id: "C", x: 350, y: 140 },
        { id: "D", x: 480, y: 140 }, { id: "E", x: 110, y: 165 }
      ],
      edges: [
        { source: "A", target: "B", weight: 1 }, { source: "C", target: "D", weight: 1 }
      ]
    },
    kahnSelfLoop: {
      nodes: [{ id: "A", x: 295, y: 100 }],
      edges: [{ source: "A", target: "A", weight: 1 }]
    },
    kahnDuplicateEdge: {
      nodes: [
        { id: "A", x: 120, y: 100 }, { id: "B", x: 295, y: 100 }, { id: "C", x: 470, y: 100 }
      ],
      edges: [
        { source: "A", target: "B", weight: 1 }, { source: "A", target: "B", weight: 1 }, { source: "B", target: "C", weight: 1 }
      ]
    }
  };

  function recorder(initialState, initialVariables = {}) {
    const steps = [];
    const counters = { comparisons: 0, swaps: 0, writes: 0, visits: 0, calls: 0, moves: 0 };
    return {
      counters,
      add(title, message, phase, lineKey, state, variables = {}) {
        steps.push({
          title,
          message,
          phase,
          lineKey,
          state: clone(state ?? initialState),
          variables: clone({ ...initialVariables, ...variables }),
          counters: clone(counters)
        });
      },
      steps
    };
  }

  function arrayPreset(preset) {
    if (preset === "nearly") return [1, 2, 3, 5, 4, 6];
    if (preset === "reverse") return [6, 5, 4, 3, 2, 1];
    return [7, 3, 9, 2, 6, 1];
  }

  function searchPreset(preset) {
    const values = [3, 7, 12, 18, 24, 31, 42, 55, 63];
    const target = preset === "edge" ? 63 : preset === "missing" ? 29 : 24;
    return { values, target };
  }

  function linearSearchTrace(preset) {
    const { values, target } = searchPreset(preset);
    const state = { kind: "array", values, target, active: [], compare: [], inactive: [], sorted: [], pointers: {} };
    const trace = recorder(state, { objetivo: target, índice: "—", valor: "—" });
    trace.add("Entrada preparada", "La búsqueda comenzará en el primer índice.", "Preparación", "setup", state);

    for (let index = 0; index < values.length; index += 1) {
      state.active = [index];
      state.compare = [index];
      state.inactive = Array.from({ length: index }, (_, i) => i);
      state.pointers = { cursor: index };
      trace.counters.comparisons += 1;
      trace.add("Comparar el cursor", `${values[index]} ${values[index] === target ? "coincide" : "no coincide"} con el objetivo ${target}.`, "Comparación", "compare", state, { índice: index, valor: values[index] });
      if (values[index] === target) {
        state.found = index;
        state.compare = [];
        trace.add("Objetivo encontrado", `El valor ${target} está en el índice ${index}.`, "Resultado", "found", state, { índice: index, valor: values[index] });
        return trace.steps;
      }
    }

    state.active = [];
    state.compare = [];
    state.inactive = values.map((_, index) => index);
    trace.add("Objetivo ausente", "Se inspeccionaron todos los elementos sin encontrar una coincidencia.", "Resultado", "done", state, { índice: -1, valor: "ausente" });
    return trace.steps;
  }

  function binarySearchTrace(preset) {
    const { values, target } = searchPreset(preset);
    let low = 0;
    let high = values.length - 1;
    const state = { kind: "array", values, target, active: values.map((_, i) => i), compare: [], inactive: [], sorted: [], pointers: { low, high } };
    const trace = recorder(state, { objetivo: target, low, mid: "—", high });
    trace.add("Intervalo inicial", "Todo el arreglo ordenado puede contener el objetivo.", "Preparación", "setup", state);

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      state.active = values.map((_, index) => index).filter((index) => index >= low && index <= high);
      state.inactive = values.map((_, index) => index).filter((index) => index < low || index > high);
      state.compare = [mid];
      state.pointers = { low, mid, high };
      trace.add("Elegir el punto medio", `El intervalo [${low}, ${high}] produce mid = ${mid}.`, "Partición", "inspect", state, { low, mid, high });
      trace.counters.comparisons += 1;
      trace.add("Comparar con el objetivo", `${values[mid]} ${values[mid] === target ? "coincide" : values[mid] < target ? "es menor" : "es mayor"} que ${target}.`, "Comparación", "compare", state, { low, mid, high });

      if (values[mid] === target) {
        state.found = mid;
        state.compare = [];
        trace.add("Objetivo encontrado", `El objetivo queda confirmado en el índice ${mid}.`, "Resultado", "found", state, { low, mid, high });
        return trace.steps;
      }

      if (values[mid] < target) low = mid + 1;
      else high = mid - 1;
      state.pointers = { low, high };
      state.active = values.map((_, index) => index).filter((index) => index >= low && index <= high);
      state.inactive = values.map((_, index) => index).filter((index) => index < low || index > high);
      state.compare = [];
      trace.add("Descartar media entrada", `El siguiente intervalo candidato es [${low}, ${high}].`, "Reducción", "update", state, { low, mid: "—", high });
    }

    state.active = [];
    state.compare = [];
    state.inactive = values.map((_, index) => index);
    trace.add("Objetivo ausente", "El intervalo quedó vacío; el objetivo no pertenece al arreglo.", "Resultado", "done", state, { low, mid: "—", high });
    return trace.steps;
  }

  function jumpSearchTrace(preset) {
    const { values, target } = searchPreset(preset);
    const blockSize = Math.floor(Math.sqrt(values.length));
    let start = 0;
    let end = Math.min(blockSize - 1, values.length - 1);
    const state = { kind: "array", values, target, active: values.map((_, index) => index), compare: [], inactive: [], sorted: [], pointers: { inicio: start, fin: end } };
    const trace = recorder(state, { objetivo: target, bloque: blockSize, inicio: start, fin: end });
    trace.add("Calcular el salto", `√${values.length} produce bloques de ${blockSize} posiciones.`, "Preparación", "block", state);

    while (end < values.length && values[end] < target) {
      state.compare = [end];
      state.pointers = { inicio: start, fin: end };
      trace.counters.comparisons += 1;
      trace.add("Saltar un bloque", `${values[end]} es menor que ${target}; el bloque [${start}, ${end}] queda descartado.`, "Salto", "jump", state, { objetivo: target, bloque: blockSize, inicio: start, fin: end });
      start = end + 1;
      if (start >= values.length) break;
      end = Math.min(end + blockSize, values.length - 1);
      state.inactive = values.map((_, index) => index).filter((index) => index < start);
      state.active = values.map((_, index) => index).filter((index) => index >= start && index <= end);
    }

    if (start < values.length) {
      state.active = values.map((_, index) => index).filter((index) => index >= start && index <= end);
      state.compare = [];
      state.pointers = { inicio: start, fin: end };
      trace.add("Bloque candidato", `La búsqueda lineal se limita al intervalo [${start}, ${end}].`, "Exploración", "scan", state, { objetivo: target, bloque: blockSize, inicio: start, fin: end });
      for (let index = start; index <= end; index += 1) {
        state.compare = [index];
        state.pointers = { cursor: index, fin: end };
        trace.counters.comparisons += 1;
        trace.add("Comparar dentro del bloque", `${values[index]} ${values[index] === target ? "coincide" : "no coincide"} con ${target}.`, "Comparación", "compare", state, { objetivo: target, bloque: blockSize, inicio: index, fin: end });
        if (values[index] === target) {
          state.found = index;
          state.compare = [];
          trace.add("Objetivo encontrado", `El valor ${target} está en el índice ${index}.`, "Resultado", "found", state, { objetivo: target, bloque: blockSize, inicio: index, fin: end });
          return trace.steps;
        }
        if (values[index] > target) break;
      }
    }

    state.active = [];
    state.compare = [];
    state.inactive = values.map((_, index) => index);
    trace.add("Objetivo ausente", "Ninguna posición del bloque candidato contiene el objetivo.", "Resultado", "done", state, { objetivo: target, bloque: blockSize, inicio: start, fin: end });
    return trace.steps;
  }

  function interpolationSearchTrace(preset) {
    const { values, target } = searchPreset(preset);
    let low = 0;
    let high = values.length - 1;
    const state = { kind: "array", values, target, active: values.map((_, index) => index), compare: [], inactive: [], sorted: [], pointers: { low, high } };
    const trace = recorder(state, { objetivo: target, low, posición: "—", high });
    trace.add("Intervalo inicial", "Los extremos acotan el valor que se desea localizar.", "Preparación", "setup", state);

    while (low <= high && target >= values[low] && target <= values[high]) {
      const range = values[high] - values[low];
      const position = range === 0 ? low : Math.min(high, low + Math.floor(((target - values[low]) * (high - low)) / range));
      state.active = values.map((_, index) => index).filter((index) => index >= low && index <= high);
      state.inactive = values.map((_, index) => index).filter((index) => index < low || index > high);
      state.compare = [position];
      state.pointers = { low, estimado: position, high };
      trace.add("Estimar la posición", `La proporción entre ${values[low]} y ${values[high]} sugiere el índice ${position}.`, "Estimación", "estimate", state, { objetivo: target, low, posición: position, high });
      trace.counters.comparisons += 1;
      trace.add("Comparar la estimación", `${values[position]} ${values[position] === target ? "coincide" : values[position] < target ? "es menor" : "es mayor"} que ${target}.`, "Comparación", "compare", state, { objetivo: target, low, posición: position, high });
      if (values[position] === target) {
        state.found = position;
        state.compare = [];
        trace.add("Objetivo encontrado", `La estimación confirmó el índice ${position}.`, "Resultado", "found", state, { objetivo: target, low, posición: position, high });
        return trace.steps;
      }
      if (values[position] < target) low = position + 1;
      else high = position - 1;
      state.pointers = { low, high };
      trace.add("Reducir el intervalo", `El nuevo intervalo es [${low}, ${high}].`, "Actualización", "update", state, { objetivo: target, low, posición: position, high });
    }

    state.active = [];
    state.compare = [];
    state.inactive = values.map((_, index) => index);
    trace.add("Objetivo ausente", "El objetivo quedó fuera del intervalo acotado.", "Resultado", "done", state, { objetivo: target, low, posición: "—", high });
    return trace.steps;
  }

  function bubbleSortTrace(preset) {
    const values = arrayPreset(preset);
    const state = { kind: "array", values, active: [], compare: [], inactive: [], sorted: [], pointers: {} };
    const trace = recorder(state, { pasada: 1, i: "—", fin: values.length - 1 });
    trace.add("Entrada preparada", "Cada pasada llevará el mayor valor pendiente hacia la derecha.", "Preparación", "setup", state);

    for (let end = values.length - 1, pass = 1; end > 0; end -= 1, pass += 1) {
      let swapped = false;
      for (let index = 0; index < end; index += 1) {
        state.compare = [index, index + 1];
        state.active = Array.from({ length: end + 1 }, (_, i) => i);
        state.pointers = { i: index, j: index + 1 };
        trace.counters.comparisons += 1;
        trace.add("Comparar adyacentes", `Se comparan ${values[index]} y ${values[index + 1]}.`, "Comparación", "compare", state, { pasada: pass, i: index, fin: end });
        if (values[index] > values[index + 1]) {
          [values[index], values[index + 1]] = [values[index + 1], values[index]];
          swapped = true;
          trace.counters.swaps += 1;
          trace.counters.writes += 2;
          trace.add("Intercambiar el par", "El mayor avanza una posición hacia el extremo ordenado.", "Intercambio", "swap", state, { pasada: pass, i: index, fin: end });
        }
      }
      state.sorted = Array.from({ length: values.length - end }, (_, i) => end + i);
      state.compare = [];
      trace.add("Cerrar la pasada", `El índice ${end} ya contiene su valor definitivo.`, "Confirmación", "mark", state, { pasada: pass, i: "—", fin: end });
      if (!swapped) break;
    }
    state.sorted = values.map((_, index) => index);
    state.active = [];
    trace.add("Arreglo ordenado", "No quedan pares fuera de orden.", "Resultado", "done", state, { pasada: "fin", i: "—", fin: 0 });
    return trace.steps;
  }

  function insertionSortTrace(preset) {
    const values = arrayPreset(preset);
    const state = { kind: "array", values, active: [0], compare: [], inactive: [], sorted: [0], pointers: {} };
    const trace = recorder(state, { índice: 1, clave: "—", posición: "—" });
    trace.add("Prefijo inicial", "Un elemento por sí solo ya está ordenado.", "Preparación", "setup", state);

    for (let index = 1; index < values.length; index += 1) {
      const key = values[index];
      let position = index - 1;
      state.active = Array.from({ length: index + 1 }, (_, i) => i);
      state.sorted = Array.from({ length: index }, (_, i) => i);
      state.compare = [index];
      state.pointers = { key: index };
      trace.add("Reservar la clave", `Se inserta ${key} dentro del prefijo ordenado.`, "Selección", "select", state, { índice: index, clave: key, posición: position });

      while (position >= 0) {
        state.compare = [position, position + 1];
        trace.counters.comparisons += 1;
        trace.add("Comparar con el prefijo", `${values[position]} ${values[position] > key ? "debe desplazarse" : "queda antes de la clave"}.`, "Comparación", "compare", state, { índice: index, clave: key, posición: position });
        if (values[position] <= key) break;
        values[position + 1] = values[position];
        trace.counters.writes += 1;
        trace.add("Desplazar a la derecha", `El valor ${values[position]} libera una posición para la clave.`, "Desplazamiento", "shift", state, { índice: index, clave: key, posición: position });
        position -= 1;
      }
      values[position + 1] = key;
      trace.counters.writes += 1;
      state.sorted = Array.from({ length: index + 1 }, (_, i) => i);
      state.compare = [position + 1];
      state.pointers = { insert: position + 1 };
      trace.add("Insertar la clave", `${key} ocupa el índice ${position + 1}; el prefijo vuelve a estar ordenado.`, "Inserción", "insert", state, { índice: index, clave: key, posición: position + 1 });
    }
    state.sorted = values.map((_, index) => index);
    state.active = [];
    state.compare = [];
    trace.add("Arreglo ordenado", "Cada elemento fue insertado dentro de un prefijo válido.", "Resultado", "done", state, { índice: "fin", clave: "—", posición: "—" });
    return trace.steps;
  }

  function selectionSortTrace(preset) {
    const values = arrayPreset(preset);
    const state = { kind: "array", values, active: values.map((_, index) => index), compare: [], inactive: [], sorted: [], pointers: {} };
    const trace = recorder(state, { posición: 0, mínimo: 0, candidato: "—" });
    trace.add("Arreglo preparado", "La primera posición recibirá el menor valor de toda la entrada.", "Preparación", "setup", state);

    for (let position = 0; position < values.length - 1; position += 1) {
      let minimum = position;
      state.active = values.map((_, index) => index).filter((index) => index >= position);
      state.compare = [position];
      state.pointers = { posición: position, mínimo: minimum };
      trace.add("Iniciar la selección", `${values[position]} es el mínimo provisional del sufijo.`, "Selección", "select", state, { posición: position, mínimo: minimum, candidato: values[minimum] });
      for (let candidate = position + 1; candidate < values.length; candidate += 1) {
        state.compare = [minimum, candidate];
        state.pointers = { posición: position, mínimo: minimum, candidato: candidate };
        trace.counters.comparisons += 1;
        trace.add("Comparar candidato", `Se compara ${values[candidate]} con el mínimo provisional ${values[minimum]}.`, "Comparación", "compare", state, { posición: position, mínimo: minimum, candidato: candidate });
        if (values[candidate] < values[minimum]) {
          minimum = candidate;
          state.pointers = { posición: position, mínimo: minimum };
          trace.add("Nuevo mínimo", `${values[minimum]} pasa a ser el menor valor pendiente.`, "Selección", "minimum", state, { posición: position, mínimo: minimum, candidato: candidate });
        }
      }
      if (minimum !== position) {
        [values[position], values[minimum]] = [values[minimum], values[position]];
        trace.counters.swaps += 1;
        trace.counters.writes += 2;
        state.compare = [position, minimum];
        trace.add("Colocar el mínimo", `${values[position]} queda fijado en la posición ${position}.`, "Intercambio", "swap", state, { posición: position, mínimo: minimum, candidato: "—" });
      }
      state.sorted.push(position);
    }
    state.sorted = values.map((_, index) => index);
    state.active = [];
    state.compare = [];
    state.pointers = {};
    trace.add("Arreglo ordenado", "Cada posición contiene el mínimo que correspondía a su sufijo.", "Resultado", "done", state, { posición: "fin", mínimo: "—", candidato: "—" });
    return trace.steps;
  }

  function mergeSortTrace(preset) {
    const values = arrayPreset(preset);
    const state = { kind: "array", values, active: values.map((_, i) => i), compare: [], inactive: [], sorted: [], pointers: {}, ranges: [] };
    const trace = recorder(state, { rango: `[0, ${values.length - 1}]`, nivel: 0, auxiliar: "—" });
    trace.add("Rango inicial", "La entrada se dividirá hasta obtener segmentos unitarios.", "Preparación", "setup", state);

    function sort(left, right, level) {
      trace.counters.calls += 1;
      if (left >= right) {
        state.active = [left];
        state.ranges = [[left, right]];
        trace.add("Caso base", `El segmento [${left}, ${right}] ya está ordenado.`, "Recursión", "base", state, { rango: `[${left}, ${right}]`, nivel: level, auxiliar: "—" });
        return;
      }
      const mid = Math.floor((left + right) / 2);
      state.active = Array.from({ length: right - left + 1 }, (_, i) => left + i);
      state.ranges = [[left, mid], [mid + 1, right]];
      trace.add("Dividir el rango", `[${left}, ${right}] se separa en [${left}, ${mid}] y [${mid + 1}, ${right}].`, "División", "split", state, { rango: `[${left}, ${right}]`, nivel: level, auxiliar: "—" });
      sort(left, mid, level + 1);
      sort(mid + 1, right, level + 1);

      const merged = [];
      let i = left;
      let j = mid + 1;
      while (i <= mid && j <= right) {
        state.compare = [i, j];
        trace.counters.comparisons += 1;
        trace.add("Comparar ambas mitades", `Se elige entre ${values[i]} y ${values[j]}.`, "Mezcla", "merge", state, { rango: `[${left}, ${right}]`, nivel: level, auxiliar: `[${merged.join(", ")}]` });
        if (values[i] <= values[j]) merged.push(values[i++]);
        else merged.push(values[j++]);
      }
      while (i <= mid) merged.push(values[i++]);
      while (j <= right) merged.push(values[j++]);
      merged.forEach((value, offset) => { values[left + offset] = value; trace.counters.writes += 1; });
      state.compare = [];
      state.active = Array.from({ length: right - left + 1 }, (_, offset) => left + offset);
      state.ranges = [[left, right]];
      if (left === 0 && right === values.length - 1) state.sorted = values.map((_, index) => index);
      trace.add("Copiar el segmento", `La mezcla [${merged.join(", ")}] reemplaza el rango original.`, "Escritura", "copy", state, { rango: `[${left}, ${right}]`, nivel: level, auxiliar: `[${merged.join(", ")}]` });
    }

    sort(0, values.length - 1, 0);
    state.active = [];
    state.sorted = values.map((_, index) => index);
    trace.add("Arreglo ordenado", "Todas las mezclas regresaron segmentos válidos.", "Resultado", "done", state, { rango: "completo", nivel: 0, auxiliar: "liberado" });
    return trace.steps;
  }

  function quickSortTrace(preset) {
    const values = arrayPreset(preset);
    const state = { kind: "array", values, active: values.map((_, i) => i), compare: [], inactive: [], sorted: [], pivot: null, pointers: {} };
    const trace = recorder(state, { low: 0, high: values.length - 1, pivote: "—" });
    const fixed = new Set();
    trace.add("Rango inicial", "El último valor de cada rango se usará como pivote.", "Preparación", "setup", state);

    function sort(low, high) {
      trace.counters.calls += 1;
      if (low > high) return;
      if (low === high) {
        fixed.add(low);
        state.sorted = [...fixed];
        trace.add("Caso base", `El índice ${low} ya está en su posición final.`, "Recursión", "base", state, { low, high, pivote: values[low] });
        return;
      }
      const pivotValue = values[high];
      let boundary = low - 1;
      state.active = Array.from({ length: high - low + 1 }, (_, i) => low + i);
      state.pivot = high;
      state.pointers = { boundary };
      trace.add("Elegir el pivote", `${pivotValue} separará valores menores y mayores.`, "Partición", "pivot", state, { low, high, pivote: pivotValue });
      for (let scan = low; scan < high; scan += 1) {
        state.compare = [scan];
        state.pointers = { boundary, scan };
        trace.counters.comparisons += 1;
        trace.add("Comparar con el pivote", `${values[scan]} ${values[scan] <= pivotValue ? "entra" : "no entra"} en la partición izquierda.`, "Comparación", "compare", state, { low, high, pivote: pivotValue });
        if (values[scan] <= pivotValue) {
          boundary += 1;
          [values[boundary], values[scan]] = [values[scan], values[boundary]];
          trace.counters.swaps += 1;
          trace.counters.writes += 2;
          state.pointers = { boundary, scan };
          trace.add("Extender la partición", `El límite de menores avanza al índice ${boundary}.`, "Intercambio", "swap", state, { low, high, pivote: pivotValue });
        }
      }
      const pivotIndex = boundary + 1;
      [values[pivotIndex], values[high]] = [values[high], values[pivotIndex]];
      trace.counters.swaps += 1;
      trace.counters.writes += 2;
      fixed.add(pivotIndex);
      state.pivot = pivotIndex;
      state.sorted = [...fixed];
      state.compare = [];
      trace.add("Fijar el pivote", `${pivotValue} queda definitivamente en el índice ${pivotIndex}.`, "Partición", "partition", state, { low, high, pivote: pivotValue });
      sort(low, pivotIndex - 1);
      sort(pivotIndex + 1, high);
    }

    sort(0, values.length - 1);
    state.active = [];
    state.pivot = null;
    state.sorted = values.map((_, index) => index);
    trace.add("Arreglo ordenado", "Todos los pivotes y casos base quedaron fijados.", "Resultado", "done", state, { low: "—", high: "—", pivote: "—" });
    return trace.steps;
  }

  function heapSortTrace(preset) {
    const values = arrayPreset(preset);
    const state = { kind: "array", values, active: values.map((_, index) => index), compare: [], inactive: [], sorted: [], pointers: {} };
    const trace = recorder(state, { raíz: "—", hijo: "—", tamaño: values.length });
    trace.add("Entrada preparada", "El arreglo se transformará en un montículo máximo.", "Preparación", "setup", state);

    function heapify(size, root) {
      let current = root;
      while (true) {
        const left = 2 * current + 1;
        const right = left + 1;
        let largest = current;
        [left, right].forEach((child) => {
          if (child >= size) return;
          state.compare = [largest, child];
          state.pointers = { raíz: current, hijo: child };
          trace.counters.comparisons += 1;
          trace.add("Comparar padre e hijo", `Se compara ${values[largest]} con ${values[child]}.`, "Comparación", "compare", state, { raíz: current, hijo: child, tamaño: size });
          if (values[child] > values[largest]) largest = child;
        });
        if (largest === current) break;
        [values[current], values[largest]] = [values[largest], values[current]];
        trace.counters.swaps += 1;
        trace.counters.writes += 2;
        state.compare = [current, largest];
        state.pointers = { raíz: current, hijo: largest };
        trace.add("Restaurar el max-heap", `${values[largest]} baja y ${values[current]} ocupa la raíz del subárbol.`, "Montículo", "heapify", state, { raíz: current, hijo: largest, tamaño: size });
        current = largest;
      }
    }

    trace.add("Construir el montículo", "Se ajustan los nodos internos desde abajo hacia arriba.", "Construcción", "build", state);
    for (let root = Math.floor(values.length / 2) - 1; root >= 0; root -= 1) heapify(values.length, root);

    for (let end = values.length - 1; end > 0; end -= 1) {
      [values[0], values[end]] = [values[end], values[0]];
      trace.counters.swaps += 1;
      trace.counters.writes += 2;
      state.compare = [0, end];
      state.sorted = values.map((_, index) => index).filter((index) => index >= end);
      state.active = values.map((_, index) => index).filter((index) => index < end);
      state.pointers = { raíz: 0, fin: end };
      trace.add("Extraer el máximo", `${values[end]} pasa al sufijo ordenado en el índice ${end}.`, "Extracción", "extract", state, { raíz: 0, hijo: "—", tamaño: end });
      state.sorted = values.map((_, index) => index).filter((index) => index >= end);
      trace.add("Fijar la posición", `El sufijo desde ${end} ya no participa en el montículo.`, "Ordenado", "mark", state, { raíz: 0, hijo: "—", tamaño: end });
      heapify(end, 0);
    }

    state.sorted = values.map((_, index) => index);
    state.active = [];
    state.compare = [];
    state.pointers = {};
    trace.add("Arreglo ordenado", "Las extracciones del máximo completaron el orden ascendente.", "Resultado", "done", state, { raíz: "—", hijo: "—", tamaño: 0 });
    return trace.steps;
  }

  function adjacency(layout) {
    const result = Object.fromEntries(layout.nodes.map(({ id }) => [id, []]));
    layout.edges.forEach(({ source, target, weight }) => {
      result[source].push({ node: target, weight });
      result[target].push({ node: source, weight });
    });
    return result;
  }

  function graphTrace(kind, preset) {
    const layout = graphLayouts[preset] || graphLayouts.connected;
    const graph = adjacency(layout);
    const frontier = ["A"];
    const discovered = new Set(kind === "bfs" ? ["A"] : []);
    const visited = [];
    const state = { kind: "graph", layout: preset in graphLayouts ? preset : "connected", algorithm: kind, current: null, visited, frontier, activeEdge: null, distances: {} };
    const trace = recorder(state, { actual: "—", frontera: "A", visitados: 0 });
    trace.add(kind === "bfs" ? "Preparar la cola" : "Preparar la pila", `A es el nodo inicial de la ${kind === "bfs" ? "cola" : "pila"}.`, "Preparación", kind === "bfs" ? "enqueue" : "push", state);

    while (frontier.length) {
      const current = kind === "bfs" ? frontier.shift() : frontier.pop();
      if (visited.includes(current)) continue;
      visited.push(current);
      discovered.add(current);
      state.current = current;
      trace.counters.visits += 1;
      trace.add("Visitar un nodo", `${current} sale de la ${kind === "bfs" ? "cola" : "pila"} y queda visitado.`, "Visita", "visit", state, { actual: current, frontera: frontier.join(" → ") || "vacía", visitados: visited.length });

      const neighbors = kind === "bfs" ? graph[current] : [...graph[current]].reverse();
      neighbors.forEach(({ node }) => {
        state.activeEdge = [current, node];
        trace.counters.comparisons += 1;
        trace.add("Inspeccionar vecino", `Se revisa la arista ${current} — ${node}.`, "Exploración", "inspect", state, { actual: current, frontera: frontier.join(" → ") || "vacía", visitados: visited.length });
        if (!discovered.has(node) && !visited.includes(node)) {
          frontier.push(node);
          if (kind === "bfs") discovered.add(node);
          trace.counters.writes += 1;
          trace.add("Agregar a la frontera", `${node} entra en la ${kind === "bfs" ? "cola" : "pila"}.`, "Descubrimiento", "discover", state, { actual: current, frontera: frontier.join(" → "), visitados: visited.length });
        }
      });
      state.activeEdge = null;
    }
    state.current = null;
    trace.add("Recorrido completo", `Orden de visita: ${visited.join(" → ")}.`, "Resultado", "done", state, { actual: "—", frontera: "vacía", visitados: visited.length });
    return trace.steps;
  }

  function dijkstraTrace(preset) {
    const layoutKey = preset === "alternate" ? "branching" : "connected";
    const layout = graphLayouts[layoutKey];
    const graph = adjacency(layout);
    const nodes = layout.nodes.map(({ id }) => id);
    const distances = Object.fromEntries(nodes.map((node) => [node, node === "A" ? 0 : Infinity]));
    const previous = {};
    const settled = [];
    const queue = new Set(nodes);
    const state = { kind: "graph", layout: layoutKey, algorithm: "dijkstra", current: null, visited: settled, frontier: [...queue], activeEdge: null, distances };
    const trace = recorder(state, { actual: "—", distancia: 0, pendientes: queue.size });
    trace.add("Inicializar distancias", "A comienza en 0 y todos los demás nodos en infinito.", "Preparación", "distance", state);

    while (queue.size) {
      let current = null;
      queue.forEach((node) => {
        if (current === null || distances[node] < distances[current]) current = node;
      });
      if (current === null || distances[current] === Infinity) break;
      queue.delete(current);
      settled.push(current);
      state.current = current;
      state.frontier = [...queue];
      trace.counters.visits += 1;
      trace.add("Extraer distancia mínima", `${current} queda confirmado con distancia ${distances[current]}.`, "Selección", "extract", state, { actual: current, distancia: distances[current], pendientes: queue.size });

      graph[current].forEach(({ node, weight }) => {
        if (!queue.has(node)) return;
        state.activeEdge = [current, node];
        const candidate = distances[current] + weight;
        trace.counters.comparisons += 1;
        trace.add("Probar una ruta", `${distances[current]} + ${weight} = ${candidate}; distancia actual de ${node}: ${distances[node] === Infinity ? "∞" : distances[node]}.`, "Relajación", "inspect", state, { actual: `${current} → ${node}`, distancia: candidate, pendientes: queue.size });
        if (candidate < distances[node]) {
          distances[node] = candidate;
          previous[node] = current;
          trace.counters.writes += 1;
          trace.add("Relajar la arista", `${node} mejora a ${candidate} por medio de ${current}.`, "Actualización", "relax", state, { actual: node, distancia: candidate, pendientes: queue.size });
        }
      });
      state.activeEdge = null;
    }
    state.current = null;
    state.frontier = [];
    trace.add("Rutas mínimas listas", Object.entries(distances).map(([node, distance]) => `${node}:${distance}`).join(" · "), "Resultado", "done", state, { actual: "—", distancia: "final", pendientes: 0 });
    return trace.steps;
  }

  function topologicalSortTrace(preset) {
    const layoutKey = preset in graphLayouts ? preset : "connected";
    const layout = graphLayouts[layoutKey];
    const nodes = layout.nodes.map(({ id }) => id);
    const incoming = Object.fromEntries(nodes.map((node) => [node, 0]));
    const outgoing = Object.fromEntries(nodes.map((node) => [node, []]));
    layout.edges.forEach(({ source, target }) => {
      incoming[target] += 1;
      outgoing[source].push(target);
    });
    const frontier = nodes.filter((node) => incoming[node] === 0);
    const order = [];
    const state = { kind: "graph", layout: layoutKey, algorithm: "topological-sort", current: null, visited: order, frontier, activeEdge: null, distances: {} };
    const trace = recorder(state, { actual: "—", listos: frontier.join(" → "), emitidos: 0 });
    trace.add("Calcular dependencias", `Grados de entrada: ${nodes.map((node) => `${node}:${incoming[node]}`).join(" · ")}.`, "Preparación", "degree", state);
    trace.add("Preparar nodos listos", `${frontier.join(" y ")} no tienen dependencias pendientes.`, "Preparación", "queue", state);

    while (frontier.length) {
      const current = frontier.shift();
      order.push(current);
      state.current = current;
      trace.counters.visits += 1;
      trace.add("Emitir un nodo", `${current} se agrega al orden topológico.`, "Selección", "extract", state, { actual: current, listos: frontier.join(" → ") || "vacía", emitidos: order.length });
      outgoing[current].forEach((target) => {
        state.activeEdge = [current, target];
        incoming[target] -= 1;
        trace.counters.comparisons += 1;
        trace.counters.writes += 1;
        trace.add("Resolver una dependencia", `La arista ${current} → ${target} reduce el grado de ${target} a ${incoming[target]}.`, "Actualización", "update", state, { actual: target, listos: frontier.join(" → ") || "vacía", emitidos: order.length });
        if (incoming[target] === 0) {
          frontier.push(target);
          state.frontier = frontier;
          trace.add("Habilitar sucesor", `${target} ya no tiene predecesores pendientes y entra en la cola.`, "Descubrimiento", "enqueue", state, { actual: target, listos: frontier.join(" → "), emitidos: order.length });
        }
      });
      state.activeEdge = null;
      state.frontier = frontier;
    }
    state.current = null;
    trace.add("Orden topológico listo", order.join(" → "), "Resultado", "done", state, { actual: "—", listos: "vacía", emitidos: order.length });
    return trace.steps;
  }

  function kahnTrace(preset) {
    const layoutKey = {
      dependencies: "dependencies",
      cycle: "cycle",
      empty: "kahnEmpty",
      single: "kahnSingle",
      isolated: "kahnIsolated",
      chain: "kahnChain",
      branching: "kahnBranching",
      disconnected: "kahnDisconnected",
      "self-loop": "kahnSelfLoop",
      "duplicate-edge": "kahnDuplicateEdge"
    }[preset] || "dependencies";
    const layout = graphLayouts[layoutKey];
    const nodes = layout.nodes.map(({ id }) => id);
    const incoming = Object.fromEntries(nodes.map((node) => [node, 0]));
    const outgoing = Object.fromEntries(nodes.map((node) => [node, []]));
    layout.edges.forEach(({ source, target }) => {
      incoming[target] += 1;
      outgoing[source].push(target);
    });

    const queue = nodes.filter((node) => incoming[node] === 0);
    const order = [];
    const state = {
      kind: "graph",
      layout: layoutKey,
      algorithm: "kahn",
      current: null,
      visited: order,
      frontier: queue,
      activeEdge: null,
      distances: {},
      indegrees: incoming,
      blocked: []
    };
    const variables = () => ({
      actual: state.current || "—",
      cola: queue.join(" → ") || "vacía",
      orden: order.join(" → ") || "vacío",
      emitidos: `${order.length}/${nodes.length}`
    });
    const trace = recorder(state, variables());

    trace.add(
      "Calcular grados de entrada",
      `Cada nodo muestra cuántas dependencias conserva: ${nodes.map((node) => `${node}:${incoming[node]}`).join(" · ")}.`,
      "Preparación",
      "degree",
      state,
      variables()
    );
    trace.add(
      "Preparar la cola",
      `${queue.join(" y ")} ${queue.length === 1 ? "es el único nodo listo" : "son los nodos listos"}: su grado de entrada es cero.`,
      "Preparación",
      "queue",
      state,
      variables()
    );

    while (queue.length) {
      const current = queue.shift();
      state.current = current;
      trace.add(
        "Extraer un nodo listo",
        `${current} sale del frente de la cola; todavía no se modifica ningún sucesor.`,
        "Selección",
        "extract",
        state,
        variables()
      );

      order.push(current);
      trace.counters.visits += 1;
      trace.add(
        "Agregar al orden",
        `${current} queda emitido en la posición ${order.length} del orden topológico.`,
        "Emisión",
        "emit",
        state,
        variables()
      );

      outgoing[current].forEach((target) => {
        state.activeEdge = [current, target];
        incoming[target] -= 1;
        trace.counters.comparisons += 1;
        trace.counters.writes += 1;
        trace.add(
          "Eliminar una dependencia",
          `${current} → ${target} queda resuelta; el grado de entrada de ${target} baja a ${incoming[target]}.`,
          "Actualización",
          "update",
          state,
          variables()
        );

        if (incoming[target] === 0) {
          queue.push(target);
          trace.add(
            "Habilitar un sucesor",
            `${target} ya no tiene dependencias pendientes y entra al final de la cola.`,
            "Descubrimiento",
            "enqueue",
            state,
            variables()
          );
        }
      });
      state.activeEdge = null;
      state.current = null;
    }

    const blocked = nodes.filter((node) => !order.includes(node));
    state.blocked = blocked;
    if (blocked.length) {
      trace.add(
        "Detectar un ciclo",
        `La cola quedó vacía, pero ${blocked.join(" y ")} conservan grado de entrada positivo; esas dependencias forman un ciclo.`,
        "Verificación",
        "cycle",
        state,
        variables()
      );
      trace.add(
        "No existe un orden topológico",
        `Kahn emitió ${order.length} de ${nodes.length} nodos. El ciclo impide completar el orden.`,
        "Resultado",
        "cycle",
        state,
        variables()
      );
      return trace.steps;
    }

    trace.add(
      "Confirmar que no hay ciclos",
      `Se emitieron los ${nodes.length} nodos; ninguna dependencia quedó bloqueada.`,
      "Verificación",
      "cycle",
      state,
      variables()
    );
    trace.add(
      "Orden topológico completo",
      order.join(" → "),
      "Resultado",
      "done",
      state,
      variables()
    );
    return trace.steps;
  }

  function bellmanFordTrace(preset) {
    const layoutKey = preset === "alternate" ? "branching" : "connected";
    const layout = graphLayouts[layoutKey];
    const nodes = layout.nodes.map(({ id }) => id);
    const distances = Object.fromEntries(nodes.map((node) => [node, node === "A" ? 0 : Infinity]));
    const visited = ["A"];
    const state = { kind: "graph", layout: layoutKey, algorithm: "bellman-ford", current: null, visited, frontier: nodes.slice(1), activeEdge: null, distances };
    const trace = recorder(state, { pasada: 0, arista: "—", cambios: 0 });
    trace.add("Inicializar distancias", "A comienza en 0 y los demás nodos en infinito.", "Preparación", "distance", state);

    for (let pass = 1; pass < nodes.length; pass += 1) {
      let changes = 0;
      trace.add("Iniciar pasada", `Pasada ${pass} de ${nodes.length - 1} sobre todas las aristas.`, "Iteración", "loop", state, { pasada: pass, arista: "—", cambios: changes });
      layout.edges.forEach(({ source, target, weight }) => {
        state.current = source;
        state.activeEdge = [source, target];
        trace.counters.comparisons += 1;
        const candidate = distances[source] === Infinity ? Infinity : distances[source] + weight;
        trace.add("Inspeccionar arista", `${source} → ${target}: ${distances[source] === Infinity ? "∞" : distances[source]} + ${weight} frente a ${distances[target] === Infinity ? "∞" : distances[target]}.`, "Relajación", "inspect", state, { pasada: pass, arista: `${source}→${target}`, cambios: changes });
        if (candidate < distances[target]) {
          distances[target] = candidate;
          if (!visited.includes(target)) visited.push(target);
          state.frontier = nodes.filter((node) => !visited.includes(node));
          changes += 1;
          trace.counters.writes += 1;
          trace.add("Relajar distancia", `${target} mejora a ${candidate} mediante ${source}.`, "Actualización", "relax", state, { pasada: pass, arista: `${source}→${target}`, cambios: changes });
        }
      });
      state.activeEdge = null;
      if (changes === 0) {
        trace.add("Detener temprano", "Ninguna distancia cambió; otra pasada produciría el mismo resultado.", "Optimización", "early", state, { pasada: pass, arista: "—", cambios: 0 });
        break;
      }
    }

    trace.add("Comprobar ciclos", "Una pasada adicional verificaría si alguna distancia todavía puede disminuir.", "Verificación", "cycle", state, { pasada: "final", arista: "—", cambios: 0 });
    state.current = null;
    state.frontier = [];
    trace.add("Distancias listas", Object.entries(distances).map(([node, distance]) => `${node}:${distance}`).join(" · "), "Resultado", "done", state, { pasada: "fin", arista: "—", cambios: 0 });
    return trace.steps;
  }

  function hanoiTrace(preset) {
    const diskCount = preset === "four" ? 4 : 3;
    const rods = { A: Array.from({ length: diskCount }, (_, index) => diskCount - index), B: [], C: [] };
    const state = { kind: "hanoi", rods, moving: null, diskCount };
    const trace = recorder(state, { discos: diskCount, movimiento: 0, acción: "preparar" });
    trace.add("Torre inicial", `Los ${diskCount} discos comienzan en el poste A.`, "Preparación", "setup", state);

    function move(count, source, auxiliary, target, depth) {
      trace.counters.calls += 1;
      if (count === 1) {
        const disk = rods[source].pop();
        rods[target].push(disk);
        trace.counters.moves += 1;
        state.moving = { disk, source, target };
        trace.add("Mover un disco", `Disco ${disk}: ${source} → ${target}.`, "Movimiento", "move", state, { discos: count, movimiento: trace.counters.moves, acción: `${source} → ${target}`, profundidad: depth });
        return;
      }
      trace.add("Resolver subtorre", `Mover ${count - 1} disco${count - 1 === 1 ? "" : "s"} de ${source} a ${auxiliary}.`, "Recursión", "recurse", state, { discos: count, movimiento: trace.counters.moves, acción: `${source} → ${auxiliary}`, profundidad: depth });
      move(count - 1, source, target, auxiliary, depth + 1);
      move(1, source, auxiliary, target, depth + 1);
      trace.add("Completar subtorre", `Mover ${count - 1} disco${count - 1 === 1 ? "" : "s"} de ${auxiliary} a ${target}.`, "Recursión", "recurse", state, { discos: count, movimiento: trace.counters.moves, acción: `${auxiliary} → ${target}`, profundidad: depth });
      move(count - 1, auxiliary, source, target, depth + 1);
    }

    move(diskCount, "A", "B", "C", 1);
    state.moving = null;
    trace.add("Torre completada", `Se necesitaron ${trace.counters.moves} movimientos, exactamente 2^${diskCount} - 1.`, "Resultado", "done", state, { discos: diskCount, movimiento: trace.counters.moves, acción: "completa", profundidad: 0 });
    return trace.steps;
  }

  function nQueensTrace(preset) {
    const size = preset === "five" ? 5 : 4;
    const board = Array(size).fill(-1);
    const state = { kind: "board", size, board, active: null, conflict: null };
    const trace = recorder(state, { fila: 0, columna: "—", colocadas: 0 });
    trace.add("Tablero vacío", "Se colocará una reina por fila sin compartir columna ni diagonal.", "Preparación", "setup", state);

    function safe(row, column) {
      for (let previousRow = 0; previousRow < row; previousRow += 1) {
        const previousColumn = board[previousRow];
        if (previousColumn === column || Math.abs(previousColumn - column) === Math.abs(previousRow - row)) return false;
      }
      return true;
    }

    function solve(row) {
      trace.counters.calls += 1;
      if (row === size) return true;
      for (let column = 0; column < size; column += 1) {
        state.active = [row, column];
        trace.counters.comparisons += 1;
        const isSafe = safe(row, column);
        state.conflict = isSafe ? null : [row, column];
        trace.add("Probar una celda", `[${row}, ${column}] ${isSafe ? "no tiene conflictos" : "está atacada"}.`, "Validación", "check", state, { fila: row, columna: column, colocadas: board.filter((value) => value >= 0).length });
        if (!isSafe) continue;
        board[row] = column;
        state.conflict = null;
        trace.counters.writes += 1;
        trace.add("Colocar una reina", `La fila ${row} queda provisionalmente en la columna ${column}.`, "Decisión", "place", state, { fila: row, columna: column, colocadas: board.filter((value) => value >= 0).length });
        if (solve(row + 1)) return true;
        board[row] = -1;
        trace.counters.writes += 1;
        trace.add("Retroceder", `La rama desde [${row}, ${column}] bloqueó el tablero; se retira la reina.`, "Backtracking", "backtrack", state, { fila: row, columna: column, colocadas: board.filter((value) => value >= 0).length });
      }
      return false;
    }

    solve(0);
    state.active = null;
    state.conflict = null;
    trace.add("Solución encontrada", board.map((column, row) => `F${row + 1}:C${column + 1}`).join(" · "), "Resultado", "done", state, { fila: "fin", columna: "—", colocadas: size });
    return trace.steps;
  }

  function fibonacciTabulationTrace(preset) {
    const n = preset === "eight" ? 8 : 6;
    const values = Array(n + 1).fill("—");
    values[0] = 0;
    values[1] = 1;
    const state = { kind: "array", values, active: [0, 1], compare: [], inactive: values.map((_, index) => index).filter((index) => index > 1), sorted: [0, 1], pointers: { anterior: 0, actual: 1 } };
    const trace = recorder(state, { n, índice: 1, anterior: 0, resultado: 1 });
    trace.add("Guardar casos base", "F(0) = 0 y F(1) = 1 quedan disponibles para construir la tabla.", "Preparación", "base", state);

    for (let index = 2; index <= n; index += 1) {
      state.active = [index - 2, index - 1, index];
      state.compare = [index - 2, index - 1];
      state.inactive = values.map((_, candidate) => candidate).filter((candidate) => candidate > index);
      state.pointers = { izquierda: index - 2, derecha: index - 1, actual: index };
      trace.counters.comparisons += 1;
      trace.add("Combinar términos", `F(${index - 2}) + F(${index - 1}) = ${values[index - 2]} + ${values[index - 1]}.`, "Cálculo", "combine", state, { n, índice: index, anterior: values[index - 1], resultado: values[index - 2] + values[index - 1] });
      values[index] = values[index - 2] + values[index - 1];
      state.sorted = values.map((_, candidate) => candidate).filter((candidate) => candidate <= index);
      state.compare = [index];
      trace.counters.writes += 1;
      trace.add("Guardar término", `F(${index}) queda almacenado como ${values[index]}.`, "Escritura", "write", state, { n, índice: index, anterior: values[index - 1], resultado: values[index] });
    }

    state.active = [];
    state.compare = [];
    state.inactive = [];
    state.pointers = { resultado: n };
    trace.add("Resultado disponible", `F(${n}) = ${values[n]}.`, "Resultado", "done", state, { n, índice: n, anterior: values[n - 1], resultado: values[n] });
    return trace.steps;
  }

  function longestIncreasingSubsequenceTrace(preset) {
    const values = preset === "rising" ? [2, 3, 1, 4, 5, 7] : [10, 3, 5, 4, 8, 6];
    const dp = Array(values.length).fill(1);
    let best = 1;
    const state = { kind: "array", values, active: [0], compare: [], inactive: [], sorted: [0], pointers: { actual: 0 } };
    const trace = recorder(state, { índice: 0, previo: "—", longitud: 1, mejor: 1 });
    trace.add("Inicializar la tabla", "Cada valor forma por sí solo una subsecuencia de longitud 1.", "Preparación", "table", state);

    for (let current = 1; current < values.length; current += 1) {
      state.active = [current];
      state.compare = [];
      state.sorted = values.map((_, index) => index).filter((index) => index < current);
      state.pointers = { actual: current };
      trace.add("Procesar una posición", `Se busca la mejor subsecuencia que puede terminar en ${values[current]}.`, "Iteración", "loop", state, { índice: current, previo: "—", longitud: dp[current], mejor: best });
      for (let previous = 0; previous < current; previous += 1) {
        state.compare = [previous, current];
        state.pointers = { previo: previous, actual: current };
        trace.counters.comparisons += 1;
        trace.add("Comparar predecesor", `${values[previous]} ${values[previous] < values[current] ? "puede preceder" : "no puede preceder"} a ${values[current]}.`, "Comparación", "compare", state, { índice: current, previo: previous, longitud: dp[current], mejor: best });
        if (values[previous] < values[current] && dp[previous] + 1 > dp[current]) {
          dp[current] = dp[previous] + 1;
          best = Math.max(best, dp[current]);
          trace.counters.writes += 1;
          trace.add("Extender subsecuencia", `dp[${current}] mejora a ${dp[current]} usando el índice ${previous}.`, "Actualización", "extend", state, { índice: current, previo: previous, longitud: dp[current], mejor: best });
        }
      }
      best = Math.max(best, dp[current]);
      trace.add("Conservar el mejor", `La mejor longitud global hasta ahora es ${best}.`, "Resumen", "best", state, { índice: current, previo: "—", longitud: dp[current], mejor: best });
    }

    state.active = [];
    state.compare = [];
    state.sorted = values.map((_, index) => index);
    state.pointers = {};
    trace.add("Longitud máxima", `La subsecuencia creciente más larga tiene longitud ${best}.`, "Resultado", "done", state, { índice: "fin", previo: "—", longitud: best, mejor: best });
    return trace.steps;
  }

  function knapsackTrace(preset) {
    const items = preset === "balanced"
      ? [{ weight: 1, value: 1 }, { weight: 3, value: 4 }, { weight: 4, value: 5 }, { weight: 5, value: 7 }]
      : [{ weight: 2, value: 3 }, { weight: 3, value: 4 }, { weight: 4, value: 5 }];
    const capacity = preset === "balanced" ? 7 : 5;
    const table = Array.from({ length: items.length + 1 }, () => Array(capacity + 1).fill(0));
    const state = { kind: "dp", table, items, capacity, active: null, sources: [] };
    const trace = recorder(state, { objeto: "—", capacidad: 0, mejor: 0 });
    trace.add("Tabla base", "Con cero objetos o cero capacidad, el valor óptimo es 0.", "Preparación", "table", state);

    for (let row = 1; row <= items.length; row += 1) {
      const item = items[row - 1];
      for (let currentCapacity = 1; currentCapacity <= capacity; currentCapacity += 1) {
        const exclude = table[row - 1][currentCapacity];
        let include = -Infinity;
        state.active = [row, currentCapacity];
        state.sources = [[row - 1, currentCapacity]];
        trace.counters.comparisons += 1;
        trace.add("Evaluar una celda", `Excluir el objeto conserva ${exclude}.`, "Comparación", "exclude", state, { objeto: row, capacidad: currentCapacity, mejor: exclude });
        if (item.weight <= currentCapacity) {
          include = item.value + table[row - 1][currentCapacity - item.weight];
          state.sources = [[row - 1, currentCapacity], [row - 1, currentCapacity - item.weight]];
          trace.counters.comparisons += 1;
          trace.add("Probar inclusión", `${item.value} + ${table[row - 1][currentCapacity - item.weight]} = ${include}.`, "Comparación", "include", state, { objeto: row, capacidad: currentCapacity, mejor: Math.max(exclude, include) });
        }
        table[row][currentCapacity] = Math.max(exclude, include);
        trace.counters.writes += 1;
        trace.add("Guardar el óptimo", `dp[${row}][${currentCapacity}] = ${table[row][currentCapacity]}.`, "Escritura", "write", state, { objeto: row, capacidad: currentCapacity, mejor: table[row][currentCapacity] });
      }
    }
    state.active = [items.length, capacity];
    state.sources = [];
    trace.add("Valor óptimo", `La mejor combinación alcanza ${table[items.length][capacity]} sin superar capacidad ${capacity}.`, "Resultado", "done", state, { objeto: items.length, capacidad: capacity, mejor: table[items.length][capacity] });
    return trace.steps;
  }

  function buildTrace(algorithmId, presetId) {
    switch (algorithmId) {
      case "linear-search": return linearSearchTrace(presetId);
      case "binary-search": return binarySearchTrace(presetId);
      case "jump-search": return jumpSearchTrace(presetId);
      case "interpolation-search": return interpolationSearchTrace(presetId);
      case "bubble-sort": return bubbleSortTrace(presetId);
      case "insertion-sort": return insertionSortTrace(presetId);
      case "selection-sort": return selectionSortTrace(presetId);
      case "merge-sort": return mergeSortTrace(presetId);
      case "quick-sort": return quickSortTrace(presetId);
      case "heap-sort": return heapSortTrace(presetId);
      case "bfs": return graphTrace("bfs", presetId);
      case "dfs": return graphTrace("dfs", presetId);
      case "dijkstra": return dijkstraTrace(presetId);
      case "topological-sort": return topologicalSortTrace(presetId);
      case "kahn": return kahnTrace(presetId);
      case "bellman-ford": return bellmanFordTrace(presetId);
      case "hanoi": return hanoiTrace(presetId);
      case "n-queens": return nQueensTrace(presetId);
      case "knapsack": return knapsackTrace(presetId);
      case "fibonacci-dp": return fibonacciTabulationTrace(presetId);
      case "lis": return longestIncreasingSubsequenceTrace(presetId);
      default: return binarySearchTrace("middle");
    }
  }

  window.AlgorithmTraces = Object.freeze({ buildTrace, graphLayouts });
})();

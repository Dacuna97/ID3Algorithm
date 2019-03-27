"use strict"
var attributes = "";
var data = "";
var example = "";
class Node {

    constructor(value) {
        this.value = value;
        this.edge_tag = "";
        this.children = [];
        this.parent = null;
    }

    setParentNode(node) {
        this.parent = node;
    }

    getParentNode() {
        return this.parent;
    }

    addChild(node) {
        node.setParentNode(this);
        this.children.push(node);
    }

    getChildren() {
        return this.children;
    }

    removeChildren() {
        this.children = [];
    }
    setEdgeTag(edge_tag) {
        this.edge_tag = edge_tag;
    }
}

class Merit {
    constructor(name, column, table, index) {
        this.attribute_name = name;
        this.column = column;
        this.final_column = table[table.length - 1];
        this.p = [];
        this.n = [];
        this.N = column.length;
        this.values = [];
        this.index = index;
        this.count_values();
        this.values.forEach((element, i) => {
            this.p.push({
                name: element.name,
                value: 0
            });
            this.n.push({
                name: element.name,
                value: 0
            });
            this.column.forEach((value, j) => {
                if (value === element.name) {
                    let answer = String(this.final_column[j]).trim();
                    (answer === "si") ? this.p[i].value++: this.n[i].value++;;
                }
            });
        });
        this.p.forEach((element, index) => {
            element.value = element.value / this.values[index].times;
        });
        this.n.forEach((element, index) => {
            element.value = element.value / this.values[index].times;
        });
        this.merits = 0;
        this.values.forEach((element, index) => {
            this.merits += this.merit(element, this.p[index].value, this.n[index].value);
        });
    }
    merit(element, p, n) {
        let val1 = (element.times / this.N);
        let val2, val3;
        (p === 0) ? val2 = 0: val2 = p * (Math.log(p) / Math.log(2)) * -1;
        (n === 0) ? val3 = 0: val3 = n * (Math.log(n) / Math.log(2));
        let sol = val1 * (val2 - val3);
        return sol;
    }
    count_values() {
        this.column.forEach(element => {
            let index = this.contains(this.values, "name", element);
            if (index === -1) {
                this.values.push({
                    name: element,
                    times: 1
                });
            } else {
                this.values[index].times++;
            }
        });
    }
    contains(array, property, value) {
        let i = -1;
        array.forEach((element, index) => {
            if (element[property] === value) {
                i = index;
            }
        });
        return i;
    }
    show(array) {
        array.forEach(element => {
            console.log(element);
        });
    }

}



function mostrarContenido(contenido, id) {
    $("#" + id).text(contenido);
}

function transpose(data_matrix) {
    // now I need to change the matrix to have a matrix of columns and not of rows
    var w = data_matrix.length || 0;
    var h = data_matrix[0] instanceof Array ? data_matrix[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if (h === 0 || w === 0) {
        return [];
    }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];

    // Loop through every item in the outer array (height)
    for (i = 0; i < h; i++) {

        // Insert a new row (array)
        t[i] = [];

        // Loop through every item per item in outer array (width)
        for (j = 0; j < w; j++) {

            // Save transposed data.
            t[i][j] = data_matrix[j][i];
        }
    }
    return t;
}

function remove(table, elem, index) {
    let new_table = [];
    let table_in_rows = transpose(table);
    //for each element of that column
    table[index].forEach((element, i) => {
        if (element === elem) {
            new_table.push(table_in_rows[i]);
        }
    });
    return new_table;
}

function algorithm(data_matrix, attributes_list) {

    let t = transpose(data_matrix);

    if (t.length > 0 && t[t.length - 1].every(element => element.trim() == "si")) {
        return new Node("si");
    }
    if (t.length > 0 && t[t.length - 1].every(element => element.trim() == "no")) {
        return new Node("no");
    }
    let merits_array = [];

    attributes_list.forEach((element, i) => {
        let merit = new Merit(attributes_list[i], t[i], t, i);
        merits_array.push(merit);
    });
    let contenido = "Meritos\n";
    merits_array.sort((a, b) => {
        if (a.merits > b.merits) {
            return 1;
        }
        if (a.merits < b.merits) {
            return -1;
        }
        return 0;
    });
    merits_array.forEach(element => {
        contenido += element.attribute_name + " : " + String(element.merits) + "\n";
    });
    mostrarContenido(contenido, "contenido-archivo");
    let minor = merits_array[0];
    merits_array.splice(0, 1);
    let node = new Node(minor.attribute_name);
    minor.values.forEach(value => {
        let new_table = remove(t, value.name, minor.index);
        let child = algorithm(new_table, attributes_list);
        child.setEdgeTag(value.name);
        child.setParentNode(node);
        node.addChild(child);
    });
    return node;
}

function show(node) {
    let contenido = "";
    if (node.getChildren().length == 0) {
        let before = [];
        while (node.getParentNode() != null) {
            if (node.value.trim() === "si" || node.value.trim() === "no") {
                before.unshift("-->" + node.value + "\n");
            } else {
                let last = before[0];
                before.unshift(node.value);
                if (last[last.length - 1] === ")") {
                    before.unshift(" && ");
                }
            }
            if (node.edge_tag !== "") {
                before.unshift("(" + node.edge_tag + ")");
            }
            node = node.getParentNode();
        }
        before.unshift(node.value);
        before.forEach(element => {
            contenido += element;
        });
    }
    else{
        node.getChildren().forEach(element => {
            contenido += show(element);
        });

    }
    return contenido;
}

function mapExample(sol){
    let example_divide = example.split('\n');
    let attributes = example_divide[0].split(',');
    let rules = example_divide[1].split(',');
    alert(checkRules(sol, attributes, rules));
}
function checkRules(sol, attributes, rules){
    if(sol.value == "si" || sol.value == "no"){
        return sol.value;
    }
    let solution = "not found";
    attributes.forEach((element,index) => {
        if(element === sol.value){
            attributes.splice(index, 1);
            sol.getChildren().forEach(child => {
                if(child.edge_tag === rules[index]){
                    rules.splice(index, 1);
                    solution = checkRules(child, attributes, rules );
                }
            });
        }
    });
    return solution;
}
function main() {

    let attributes_list = attributes.split(',');
    attributes_list = attributes_list.filter(element => element != '' && element != '\n');

    let data_list = data.split('\n');
    data_list = data_list.filter(element => element != '' && element != '\n');
    data_list.splice(data_list.length - 2, 2);

    let data_matrix = [];

    data_list.forEach(element => {
        data_matrix.push(element.split(','));
    });


    attributes_list.splice(attributes_list.length - 1, 1);
    let sol = algorithm(data_matrix, attributes_list, data_matrix.length - 1);
    let sol_content = show(sol);
    mostrarContenido(sol_content, "solucion");
    $("#file-input").on("change", (e) => {
        var archivo = e.target.files[0];
        if (!archivo) {
            return;
        }
        var lector = new FileReader();
        lector.onload = function (e) {
            example = e.target.result;
            mapExample(sol);
        }
        lector.readAsText(archivo);
    });
};

$(() => {
    let contador = 0;
    $("#file-input").on("change", (e) => {
        contador++;
        var archivo = e.target.files[0];
        if (!archivo) {
            return;
        }
        var lector = new FileReader();
        lector.onload = function (e) {
            var contenido = e.target.result;
            if (contador === 1) {
                attributes = contenido;
            } else if (contador === 2) {
                data = contenido;
                main();
            } else {
                contador = 0;
            }

        };
        lector.readAsText(archivo);
    });

});
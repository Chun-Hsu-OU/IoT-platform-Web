var uuid = getCookie("checker");

var tree_data = [];

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function set_area_cookie(Id) {
  document.cookie = 'area=' + Id;
}

function set_group_cookie(Id) {
  document.cookie = 'group=' + Id;
}

function make_config(root) {
  // ************** Generate the tree diagram	 *****************
  var margin = {
      top: 20,
      right: 120,
      bottom: 20,
      left: 120
    },
    width = 960 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

  var i = 0;
  var tree = d3.layout.tree()
    .size([height, width]);
  var diagonal = d3.svg.diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });
  var svg = d3.select("#Tree_graph").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //root = treeData[0];

  update(root);

  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
      d.y = d.depth * 180;
    });
    // Declare the nodes…
    var node = svg.selectAll("g.node")
      .data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });
    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      })
      .on("click", click);
    nodeEnter.append("circle")
      .attr("r", 10)
      .style("fill", "#fff");
    nodeEnter.append("text")
      .attr("x", function(d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function(d) {
        return d.name;
      })
      .style("fill-opacity", 1);
    // Declare the links…
    var link = svg.selectAll("path.link")
      .data(links, function(d) {
        return d.target.id;
      });
    // Enter the links.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", diagonal);
  }

  function click(d) {
    if (d.type == "area"){
      set_area_cookie(d.id);
      window.location.replace('../../area_page.html');
    }
    else if (d.type == "group"){
      set_group_cookie(d.id);
      window.location.replace('../../sensorhub.html');
    }
  }
}

function draw_tree() {
  var tree_data = [];
  $.get(api_url + 'api/account/single/' + uuid + '?token=' + token, function(account_body) {
    tree_data.push({
      "name": account_body.name,
      "parent": "null",
      "children": []
    });

    $.get(api_url + 'api/area/' + uuid + '?token=' + token, function(data) {
      var area_body = JSON.parse(data);

      var area_visible = [];
      var area_index = 0;
      for(let area_count = 0; area_count < area_body.Count; area_count++){
        if (area_body.Items[area_count].visible == 1) {
          area_visible[area_index] = area_count;
          area_index++;
        }
      }

      for (let area_count = 0; area_count < area_visible.length; area_count++) {
        var current_area = area_body.Items[area_visible[area_count]];
        tree_data[0].children.push({
          "name": current_area.name,
          "parent": account_body.name,
          "id": current_area.areaId,
          "type": "area",
          "children": []
        });

        $.get(api_url + 'api/sensorgroup_in_area/' + current_area.areaId + '?token=' + token, function(data) {
          var group_body = JSON.parse(data);

          var group_visible = [];
          var group_index = 0;
          for(let group_count = 0; group_count < group_body.Count; group_count++){
            if (group_body.Items[group_count].visible == 1) {
              group_visible[group_index] = group_count;
              group_index++;
            }
          }

          for (let group_count = 0; group_count < group_visible.length; group_count++) {
            var current_group = group_body.Items[group_visible[group_count]];
              
            tree_data[0].children[area_count].children.push({
              "name": current_group.name,
              "parent": current_area.name,
              "id": current_group.groupId,
              "type": "group",
              "children": []
            });

            $.get(api_url + 'api/sensors_in_group/' + current_group.groupId + '?token=' + token, function(data) {
              var sensor_body = JSON.parse(data);
              for (let sensor_count = 0; sensor_count < sensor_body.Count; sensor_count++) {
                if (sensor_body.Items[sensor_count].visible) {
                  tree_data[0].children[area_count].children[group_count].children.push({
                    "name": sensor_body.Items[sensor_count].name,
                    "parent": current_group.name,
                    "id": sensor_body.Items[sensor_count].sensorId,
                    "type": "sensor"
                  });
                }
              }
            });
          }
        });
      }
    });
    //console.log(tree_data[0]);

    setTimeout(function() {
      make_config(tree_data[0])
    }, 1500);
  });
}
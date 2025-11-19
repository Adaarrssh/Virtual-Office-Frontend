AFRAME.registerComponent("scene-setup", {
  init: function () {
    // Workstations - Increased to 12 and placed in cool clusters
    const wsContainer = document.getElementById("workstations");
    const wsPositions = [
      [-6, 0, -3],
      [-2, 0, -3],
      [2, 0, -3],
      [6, 0, -3],
      [-6, 0, -7],
      [-2, 0, -7],
      [2, 0, -7],
      [6, 0, -7],
      [-4, 0, 1],
      [0, 0, 1],
      [4, 0, 1],
      [-4, 0, 5],
      [0, 0, 5],
      [4, 0, 5],
    ];

    wsPositions.forEach((pos) => {
      const entity = document.createElement("a-entity");
      entity.setAttribute("gltf-model", "#workstation");
      entity.setAttribute("position", pos.join(" "));
      entity.setAttribute("scale", "0.5 0.5 0.5");
      wsContainer.appendChild(entity);
    });

    // Plants - Total 10, randomly placed
    const plantCount = 10;
    const plantContainer = document.getElementById("plants");
    for (let i = 0; i < plantCount; i++) {
      const randomX = Math.random() * 18 - 9;
      const randomZ = Math.random() * 18 - 9;
      const entity = document.createElement("a-entity");
      entity.setAttribute("gltf-model", "#plant");
      entity.setAttribute("position", `${randomX} 0 ${randomZ}`);
      entity.setAttribute("scale", "0.3 0.3 0.3");
      plantContainer.appendChild(entity);
    }

    // Beanbags - Total 10, randomly placed
    const beanbagCount = 10;
    const bbContainer = document.getElementById("beanbags");
    for (let i = 0; i < beanbagCount; i++) {
      const randomX = Math.random() * 18 - 9;
      const randomZ = Math.random() * 18 - 9;
      const entity = document.createElement("a-entity");
      entity.setAttribute("gltf-model", "#beanbag");
      entity.setAttribute("position", `${randomX} 0 ${randomZ}`);
      entity.setAttribute("scale", "0.5 0.5 0.5");
      bbContainer.appendChild(entity);
    }

    // Arcades - Positioned flush against the wall and facing the user
    const arcadePositions = [
      [8, 0, -9.4],
      [6.5, 0, -9.4],
      [5, 0, -9.4],
    ];
    const arcadeContainer = document.getElementById("arcades");
    arcadePositions.forEach((pos) => {
      const entity = document.createElement("a-entity");
      entity.setAttribute("gltf-model", "#arcade");
      entity.setAttribute("position", pos.join(" "));
      entity.setAttribute("scale", "0.3 0.3 0.3");
      entity.setAttribute("rotation", "0 0 0");
      arcadeContainer.appendChild(entity);
    });
  },
});

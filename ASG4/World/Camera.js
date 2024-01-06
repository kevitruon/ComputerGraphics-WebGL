class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -10]);
        this.up = new Vector3([0, 1, 0]);
    }

    moveForward() {
        var d = new Vector3([0, 0, 0]);

        d.set(this.at);
        d.sub(this.eye);
        d.normalize();

        d.mul(0.1);
        this.at.add(d);
        this.eye.add(d);
    }

    moveBackward() {
        var d = new Vector3([0, 0, 0]);

        d.set(this.at);
        d.sub(this.eye);
        d.normalize();

        d.mul(0.1);
        this.at.sub(d);
        this.eye.sub(d);
    }

    moveLeft() {
        var d = new Vector3([0, 0, 0]);

        d.set(this.at);
        d.sub(this.eye);
        d.normalize();

        let left = Vector3.cross(d, this.up);
        left.mul(0.1);
        this.at.add(left);
        this.eye.add(left);
    }

    moveRight() {
        var d = new Vector3([0, 0, 0]);

        d.set(this.at);
        d.sub(this.eye);
        d.normalize();

        var right = Vector3.cross(d, this.up);
        right.mul(0.1);
        this.eye.sub(right);
        this.at.sub(right);
    }

    panLeft() {
      let l = new Vector3([0, 0, 0]);
      l.set(this.at);
      l.sub(this.eye);

      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(5,  this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      
      let rotate = rotationMatrix.multiplyVector3(l);
      let temp = new Vector3([0, 0, 0]);
      temp.set(this.eye);
      this.at = temp.add(rotate);
    }

    panRight() {
      let l = new Vector3([0, 0, 0]);
      l.set(this.at);
      l.sub(this.eye);

      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(-5,  this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      
      let rotate = rotationMatrix.multiplyVector3(l);
      let temp = new Vector3([0, 0, 0]);
      temp.set(this.eye);
      this.at = temp.add(rotate);
    }
}
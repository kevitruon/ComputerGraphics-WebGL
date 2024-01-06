class Cube
{
    constructor()
    {
        this.type = "cube";
        this.position = [0, 0, 0];
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.textureNum = -2;

    }
    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3DUV([0, 0, 0,  1, 1, 0,   1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0,   0, 1, 0,   1, 1, 0], [0, 0, 0, 1, 1, 1]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        
        // other sides
        // Top
        //drawTriangle3D( [0, 1, 0,   0, 1, 1,   1, 1, 1]);
        //drawTriangle3D( [0, 1, 0,   1, 1, 1,   1, 1, 0]);

        drawTriangle3DUV([0, 1, 0,   0, 1, 1,   1, 1, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 1, 0,   1, 1, 1,   1, 1, 0], [0, 0, 1, 1, 1, 0]);

        // right side
        //drawTriangle3D( [1, 1, 1,   1, 1, 0,   1, 0, 0]);
        //drawTriangle3D( [1, 0, 1,   1, 1, 1,   1, 0, 0]);

        drawTriangle3DUV([1, 1, 1,   1, 1, 0,   1, 0, 0], [1, 1, 1, 0, 0, 0]);
        drawTriangle3DUV([1, 0, 1,   1, 1, 1,   1, 0, 0], [1, 0, 1, 1, 0, 0]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // back
        // drawTriangle3D( [1, 0, 1,   0, 1, 1,   1, 1, 1]);
        // drawTriangle3D( [1, 0, 1,   0, 1, 1,   0, 0, 1]);

        drawTriangle3DUV([0, 0, 1,   1, 1, 1,   1, 0, 1], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 1,   0, 1, 1,   1, 1, 1], [0, 0, 0, 1, 1, 1]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        // bottom
        // drawTriangle3D( [1, 0, 1,   0, 0, 1,   1, 0, 0]);
        // drawTriangle3D( [0, 0, 0,   0, 0, 1,   1, 0, 0]);

        drawTriangle3DUV([1, 0, 1,   0, 0, 1,   1, 0, 0], [0, 1, 0, 1, 0, 0]);
        drawTriangle3DUV([0, 0, 0,   0, 0, 1,   1, 0, 0], [0, 0, 0, 1, 0, 0]);
        
        // left
        // drawTriangle3D([0, 0, 0,   0, 1, 0,   0, 0, 1]);
        // drawTriangle3D([0, 1, 0,   0, 1, 1,   0, 0, 1]);

        drawTriangle3DUV([0, 0, 0,   0, 1, 0,   0, 0, 1], [0, 0, 1, 0, 0, 1]);
        drawTriangle3DUV([0, 1, 0,   0, 1, 1,   0, 0, 1], [1, 0, 1, 1, 0, 1]);
    }
    renderfast()
    {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var vertices = [];
        var uv = [];

        // Front
        vertices = vertices.concat([0, 0, 0,  1, 1, 0,   1, 0, 0]);
        vertices = vertices.concat([0, 0, 0,   0, 1, 0,   1, 1, 0]);
        uv = uv.concat([0, 0, 1, 1, 1, 0]);
        uv = uv.concat([0, 0, 0, 1, 1, 1]);

        // Top
        vertices = vertices.concat([0, 1, 0,   0, 1, 1,   1, 1, 1]);
        vertices = vertices.concat([0, 1, 0,   1, 1, 1,   1, 1, 0]);
        uv = uv.concat([0, 0, 0, 1, 1, 1]);
        uv = uv.concat([0, 0, 1, 1, 1, 0]);
        
        // Right
        vertices = vertices.concat([1, 1, 1,   1, 1, 0,   1, 0, 0]);
        vertices = vertices.concat([1, 0, 1,   1, 1, 1,   1, 0, 0]);
        uv = uv.concat([1, 1, 1, 0, 0, 0]);
        uv = uv.concat([1, 0, 1, 1, 0, 0]);

        // Back
        vertices = vertices.concat([0,0,1, 1,1,1, 1,0,1]);
        vertices = vertices.concat([0,0,1, 0,1,1, 1,1,1]);
        uv = uv.concat([0, 0, 1, 1, 1, 0]);
        uv = uv.concat([0, 0, 0, 1, 1, 1]);

        //Bottom 
        vertices = vertices.concat([1, 0, 1,   0, 0, 1,   1, 0, 0]);
        vertices = vertices.concat([0, 0, 0,   0, 0, 1,   1, 0, 0]);
        uv = uv.concat([0, 1, 0, 1, 0, 0]);
        uv = uv.concat([0, 0, 0, 1, 0, 0]);

        // Left
        vertices = vertices.concat([0, 0, 0,   0, 1, 0,   0, 0, 1]);
        vertices = vertices.concat([0, 1, 0,   0, 1, 1,   0, 0, 1]);
        uv = uv.concat([0, 0, 1, 0, 0, 1]);
        uv = uv.concat([1, 0, 1, 1, 0, 1]);da
    }
}
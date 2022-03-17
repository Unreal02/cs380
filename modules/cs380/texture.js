import gl from '../gl.js'

export class Texture {
    constructor() {
        this.finalize();
    }

    finalize() {
        gl.deleteTexture(this.id);
        this.initialized = false;
    }

    initialize(img) {
        if (this.initialized) this.finalize();

        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.SRGB8_ALPHA8,
            img.naturalWidth,
            img.naturalHeight,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        this.initialized = true;
    }
}

export class Cubemap {
    constructor() {
        this.finalize();
    }

    finalize() {
        gl.deleteTexture(this.id);
        this.initialized = false;
    }

    initialize(imgs) {
        if (this.initialized) this.finalize();

        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.id);
        for (const [face, img] of imgs) {
            gl.texImage2D(
                face,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                img
            );
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        this.initialized = true;
    }
}

export class TextureLoader {
    static async load(paths) {
        const imgs = {};
        const promises = [];
        const loadPromiseGenerator = (img) => new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
        for (const key of Object.keys(paths)) {
            const img = new Image();
            imgs[key] = img;
            promises.push(loadPromiseGenerator(img));
            img.src = paths[key];
        }
        await Promise.all(promises);
        return imgs;
    }

    static async loadSingle(path) {
        const imgs = await this.load({'target': path});
        return imgs.target;
    }
}
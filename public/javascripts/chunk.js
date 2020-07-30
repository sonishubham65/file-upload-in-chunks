class Upload {
    nonce;
    file;
    start = 0;
    chunk = 50000;
    end = this.chunk;
    reader = new FileReader();
    progress = 0;
    ajax = {}

    constructor(file, chunk = 0) {
        this.file = file;
        if (chunk) {
            this.chunk = chunk;
        }
        this.reader.onloadend = (e) => {
            this.progress = this.start / this.file.size
            $("#progress").text((this.progress * 100).toFixed(2));
        }
        this.reader.onload = (e) => {
            console.log(e, e.target.result)
            this.ajax.upload = $.ajax("/upload", {
                data: {
                    start: this.start,
                    end: this.end,
                    nonce: this.nonce,
                    chunk: e.target.result
                },
                dataType: 'json',
                method: 'post',
            }).done((data) => {
                this.start += this.chunk;
                this.end += this.chunk;
                this.upload()
            });
        }
    }
    /**
     * @descrition: Create a nonce for new upload 
     */
    createNonce() {
        return new Promise((resolve, reject) => {
            $.ajax("/nonce", {
                data: {
                    filename: this.file.name,
                    size: this.file.size
                },
                dataType: 'json',
                method: 'post',
            }).done((data) => {
                this.nonce = data.nonce;
                resolve();
            }).fail(e => {
                reject(e)
            });
        })
    }
    /**
     * @descrition: Upload chunks for saving the file.
     */
    async upload() {
        if (this.start < this.file.size) {
            var blob = this.file.slice(this.start, this.end);
            this.reader.readAsDataURL(blob);
        } else {
            this.progress = 1;
            $("#progress").text((this.progress * 100).toFixed(2));
            await this.save();
        }
    }
    /**
     * @descrition: Save chunks in a file. 
     */
    save() {
        $("#upload").removeClass("d-none");
        $("#pause").addClass("d-none");
        $("#resume").addClass("d-none");

        return new Promise((resolve, reject) => {
            $.ajax("/save", {
                data: {
                    nonce: this.nonce
                },
                dataType: 'json',
                method: 'post',
            }).done((data) => {
                resolve();
            });
        })
    }

    pause() {
        this.ajax.upload.abort();
    }
    resume() {
        this.Pause = false;
        $.ajax("/nonce", {
            data: {
                nonce: this.nonce
            },
            dataType: 'json',
            method: 'get',
        }).done((data) => {
            this.start = data.size;
            this.end = this.start + this.chunk;
            this.upload();
        }).fail(e => {
            console.log(e)
        });
    }
}


$(document).ready(e => {
    let upload;
    $("#upload").click(async e => {
        e.preventDefault();
        $("#upload").addClass("d-none");
        $("#pause").removeClass("d-none");
        try {
            const file = $("input[name=file]")[0].files[0];
            upload = new Upload(file);
            await upload.createNonce();
            await upload.upload();
        } catch (e) {
            console.log(e)
        }
    });
    $("#pause").click(async e => {
        $("#pause").addClass("d-none");
        $("#resume").removeClass("d-none");
        e.preventDefault();
        upload.pause();
    });
    $("#resume").click(async e => {
        $("#pause").removeClass("d-none");
        $("#resume").addClass("d-none");
        e.preventDefault();
        upload.resume();
    });
})
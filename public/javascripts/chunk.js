class Upload {
    nonce;
    file;
    start = 0;
    chunk = 10000;
    end = this.chunk;
    reader = new FileReader();
    event;
    progress = 0;

    constructor(file, chunk = 0) {
        this.file = file;
        if (chunk) {
            this.chunk = chunk;
        }
        this.reader.onloadend = (e) => {
            this.progress = this.start / this.file.size
            console.log(this.progress);
        }
        this.reader.onload = (e) => {
            $.ajax("/upload", {
                data: {
                    start: this.start,
                    end: this.end,
                    nonce: this.nonce,
                    file: e.target.result
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
            await this.save();
        }
    }
    /**
     * @descrition: Save chunks in a file. 
     */
    save() {
        return new Promise((resolve, reject) => {
            $.ajax("/save", {
                data: {
                    nonce: this.nonce,
                    filename: this.file.name
                },
                dataType: 'json',
                method: 'post',
            }).done((data) => {
                resolve();
            });
        })
    }
}
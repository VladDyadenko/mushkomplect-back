remove operator ??
this.options.length ??= bufferOrReadStream.length; on
this.options.length = this.options.length || bufferOrReadStream.length;

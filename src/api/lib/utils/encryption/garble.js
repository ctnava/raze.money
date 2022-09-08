function garble(length) {
    const characters = 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+
    'abcdefghijklmnopqrstuvwxyz'+
    '0123456789!@$%^&*?';
    const charactersLength = characters.length;
 
    var result = '';
    for ( var i = 0; i < length; i++ ) {
      const cidx = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(cidx);
    }
    return result;
 }


 module.exports = garble;
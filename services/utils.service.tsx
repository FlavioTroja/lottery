export function formattedDate(d = new Date) {
    return [d.getFullYear(), d.getMonth()+1, d.getDate()]
        .map(n => n < 10 ? `0${n}` : `${n}`).join('-');
}

export function formattedDateQuery(d = new Date) {
    return [d.getFullYear(), d.getMonth()+1, d.getDate()]
        .map(n => n < 10 ? `0${n}` : `${n}`).join('');
}

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
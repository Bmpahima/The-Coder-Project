const formatDate = (date) => {
    const formattedDate = new Date(date);
    const day = String(formattedDate.getDate()).padStart(2, '0'); 
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); 
    const year = formattedDate.getFullYear(); 
    return `${month}/${day}/${year}`;
};

const setCharInCode = (str, index, chr) => {
    return str.substring(0, index) + chr + str.substring(index + 1);
}

export {
    formatDate,
    setCharInCode
};

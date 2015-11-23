export default function index(req, res) {
  res.set('Content-Type', 'text/html');
  return res.send(
    `<h1>Bye Sails</h1>
     <img src='http://4.bp.blogspot.com/-x_5dlGGf7-Y/UI5QgR187GI/AAAAAAAAHfc/1SXejnIBPEk/s1600/391669_10151287062526202_487354444_n.jpeg' alt='Burn Sails, burn' />`
  );
}

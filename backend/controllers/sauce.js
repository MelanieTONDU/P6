const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (!sauce) {
        res.status(404).json({
          error: new Error(`L'objet n'existe pas !`)
        });
      }
      if (sauce.userId !== req.auth.userId) {
        res.status(400).json({
          error: new Error('Requête non autorisé !')
        });
      }
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié !'}))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error })); 
};
    
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (!sauce) {
        res.status(404).json({
          error: new Error('No such Thing!')
        });
      }
      if (sauce.userId !== req.auth.userId) {
        res.status(400).json({
          error: new Error('Requête non autorisé !')
        });
      }
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(404).json({ error }));
  };

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error }));
    };
  
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {
    let likes = sauce.likes;
    let usersLiked = sauce.usersLiked;
    let dislikes = sauce.dislikes;
    let usersDisliked = sauce.usersDisliked;

    if (req.body.like == 1 && !usersLiked.includes(req.body.userId)) {
      usersLiked.push(req.body.userId);
      likes++;
    }
    if (req.body.like == 0) {
      if (usersLiked.includes(req.body.userId)) {
        let userKey = usersLiked.indexOf(req.body.userId)
        usersLiked.splice(userKey, 1);
        likes--;
      }
      else if (usersDisliked.includes(req.body.userId)) {
        let userKey = usersDisliked.indexOf(req.body.userId)
        usersDisliked.splice(userKey, 1);
        dislikes--;
      }
    }
    if (req.body.like == -1 && !usersDisliked.includes(req.body.userId)) {
      usersDisliked.push(req.body.userId);
      dislikes++;
    }

    Sauce.updateOne({_id:req.params.id}, {dislikes: dislikes, likes: likes, usersDisliked:usersDisliked, usersLiked: usersLiked})
      .then(() => {res.status(200).json({ message: 'Like enregistré !'})})
      .catch((error) => {res.status(400).json({ error })});
  })
  .catch((error) => {res.status(404).json({ error })});
}
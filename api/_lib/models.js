const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom:      { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin','caissier','vendeur','livreur'], default: 'caissier' },
  actif:    { type: Boolean, default: true },
}, { timestamps: true });
UserSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; return o; };

const ProduitSchema = new mongoose.Schema({
  nom:       { type: String, required: true, trim: true },
  categorie: { type: String, enum: ['pain','viennoiserie','patisserie','boisson','autre'], default: 'autre' },
  prix:      { type: Number, required: true, min: 0 },
  stock:     { type: Number, default: 0, min: 0 },
  unite:     { type: String, default: 'unité' },
  actif:     { type: Boolean, default: true },
}, { timestamps: true });

const LigneSchema = new mongoose.Schema({
  produit:      { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
  nomProduit:   String,
  quantite:     { type: Number, required: true, min: 1 },
  prixUnitaire: { type: Number, required: true },
});

const VenteSchema = new mongoose.Schema({
  lignes:       [LigneSchema],
  total:        { type: Number, required: true },
  modePaiement: { type: String, enum: ['especes','carte','mobile_money'], default: 'especes' },
  caissier:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note:         String,
}, { timestamps: true });

module.exports = {
  User:    mongoose.models.User    || mongoose.model('User',    UserSchema),
  Produit: mongoose.models.Produit || mongoose.model('Produit', ProduitSchema),
  Vente:   mongoose.models.Vente   || mongoose.model('Vente',   VenteSchema),
};

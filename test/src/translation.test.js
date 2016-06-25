const translate = require('../../src/app/translation');
const path = require('path');

describe('transaltion', function() {
    const translations = { de: { HELLO: 'Hallo', OTHER: { VALUE: 'Haus' } }, en: { HELLO: 'Hello', OTHER: { VALUE: 'house' } } };

    it('should work with multiple languages', function() {
        const translation = translate.setup(translations);
        translation.getAvailableLanguages().length.should.be.eql(2);
        translation.getAvailableLanguages().should.include('de');
        translation.getAvailableLanguages().should.include('en');
    });

    it('should set the current language', function() {
        const translation = translate.setup(translations);
        translation.setLanguage('de');
        translation.getLanguage().should.eql('de');
        translation.setLanguage('en');
        translation.getLanguage().should.eql('en');
    });

    it('should get translation for current language', function() {
        const translation = translate.setup(translations);
        translation.setLanguage('de');
        translation.get('HELLO').should.eql(translations.de.HELLO);
        translation.setLanguage('en');
        translation.get('HELLO').should.eql(translations.en.HELLO);
    });

    it('should get translation for current language and deep keys', function() {
        const translation = translate.setup(translations);
        translation.setLanguage('de');
        translation.get('OTHER.VALUE').should.eql(translations.de.OTHER.VALUE);
        translation.setLanguage('en');
        translation.get('OTHER.VALUE').should.eql(translations.en.OTHER.VALUE);
    });

    it('should load them properly from a file', function() {
        const translation = translate.load({
            prefix: 'translation-',
            suffix: '.test.json',
            path: path.join(__dirname, '..', 'fixtures')
        });

        translation.getAvailableLanguages().length.should.be.eql(2);
        translation.getAvailableLanguages().should.include('de');
        translation.getAvailableLanguages().should.include('en');
    });

    it('should get translation for current language from file', function() {
        const translation = translate.load({
            prefix: 'translation-',
            suffix: '.test.json',
            path: path.join(__dirname, '..', 'fixtures')
        });

        translation.setLanguage('de');
        translation.get('HELLO').should.eql(translations.de.HELLO);
        translation.get('OTHER.VALUE').should.eql(translations.de.OTHER.VALUE);
        translation.setLanguage('en');
        translation.get('HELLO').should.eql(translations.en.HELLO);
        translation.get('OTHER.VALUE').should.eql(translations.en.OTHER.VALUE);
    });
});

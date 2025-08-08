import React from 'react';
import Header from '../../components/header';
import TranslationDemo from '../../components/translation-demo';

const TranslationTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="pt-20 pb-8">
        <TranslationDemo />
      </main>
    </div>
  );
};

export default TranslationTestPage;

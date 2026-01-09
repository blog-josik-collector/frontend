import React from 'react';

import { Button } from './components/ui/button';

const App: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center">
      <div className="w-full flex justify-center">
        <Button>Click me</Button>
      </div>
      <div className="w-full flex justify-center">
        <div className="flex-2 max-w-50 justify-center">Content</div>
        <div className="flex-auto justify-center">Content</div>
        <div className="flex-2 max-w-50 justify-center">Content</div>
      </div>
    </div>
  );
};

export default App;

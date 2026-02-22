import React from 'react';

const Home: React.FC = () => {
  return (
    <Box style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
      <Container size="1">
        <DecorativeBox>
          <Box py="9" />
        </DecorativeBox>
      </Container>
    </Box>
  );
};

export default Home;

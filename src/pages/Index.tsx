const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/30">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Hello World
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Your journey begins here
        </p>
      </div>
    </div>
  );
};

export default Index;

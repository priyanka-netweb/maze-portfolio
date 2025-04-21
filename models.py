from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

class Project(db.Model):
    """Model for AI/ML portfolio projects."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    technologies = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(200))
    github_url = db.Column(db.String(200))
    demo_url = db.Column(db.String(200))
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def __repr__(self):
        return f"<Project {self.title}>"

class Skill(db.Model):
    """Model for AI/ML skills."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # e.g., "Programming", "Machine Learning", "Deep Learning"
    proficiency = db.Column(db.Integer, nullable=False)  # 1-5 scale
    
    def __repr__(self):
        return f"<Skill {self.name}>"

class Experience(db.Model):
    """Model for work experience."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    current = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f"<Experience {self.title} at {self.company}>"

class Education(db.Model):
    """Model for educational background."""
    id = db.Column(db.Integer, primary_key=True)
    institution = db.Column(db.String(100), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    field = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    current = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f"<Education {self.degree} at {self.institution}>"
